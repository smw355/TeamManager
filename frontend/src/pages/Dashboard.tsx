import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserGroupIcon,
  TrophyIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { User, UserRole, Event } from '../types';
import ApiService from '../services/api';
import { useTeam } from '../contexts/TeamContext';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { currentTeam, currentRole, loading: teamLoading, error: teamError } = useTeam();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    upcomingGames: 0,
    practicesThisWeek: 0,
    totalPlayers: 0,
    nextEvent: null as Event | null
  });

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Dashboard: useEffect triggered. currentTeam:', currentTeam, 'teamLoading:', teamLoading, 'teamError:', teamError);
    if (currentTeam) {
      // eslint-disable-next-line no-console
      console.log('Dashboard: Loading dashboard data for team:', currentTeam.name);
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam]);

  const loadDashboardData = async () => {
    if (!currentTeam) return;
    
    try {
      setLoading(true);
      
      // Load events and players in parallel
      const [eventsData, playersData] = await Promise.all([
        ApiService.getEvents(currentTeam.id),
        ApiService.getTeamRoster(currentTeam.id)
      ]);

      setEvents(eventsData);

      // Calculate stats from real data
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const upcomingEvents = eventsData.filter(event => 
        new Date(event.startTime) > now
      ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      const upcomingGames = upcomingEvents.filter(event => event.type === 'game').length;
      const practicesThisWeek = eventsData.filter(event => 
        event.type === 'practice' && 
        new Date(event.startTime) > now && 
        new Date(event.startTime) < oneWeekFromNow
      ).length;

      setStats({
        upcomingGames,
        practicesThisWeek,
        totalPlayers: playersData.length,
        nextEvent: upcomingEvents[0] || null
      });

      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      // eslint-disable-next-line no-console
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardContent = (role: UserRole | null) => {
    switch (role) {
      case 'coach':
        return {
          title: 'Coach Dashboard',
          stats: [
            { name: 'Upcoming Games', value: stats.upcomingGames.toString(), icon: TrophyIcon, color: 'text-tiko-red' },
            { name: 'Practices This Week', value: stats.practicesThisWeek.toString(), icon: CalendarIcon, color: 'text-tiko-blue' },
            { name: 'Next Event', value: stats.nextEvent ? formatNextEvent(stats.nextEvent) : 'None', icon: ClockIcon, color: 'text-tiko-green' },
            { name: 'Active Players', value: stats.totalPlayers.toString(), icon: UserGroupIcon, color: 'text-tiko-orange' },
          ],
          quickActions: [
            { label: 'Schedule Event', action: () => navigate('/schedule') },
            { label: 'Create Practice Plan', action: () => navigate('/practice-plans') },
            { label: 'Activity Library', action: () => navigate('/activity-library') },
            { label: 'Manage Roster', action: () => navigate('/roster') }
          ]
        };
      case 'player_contact':
        return {
          title: 'Parent Dashboard',
          stats: [
            { name: 'Next Event', value: stats.nextEvent ? formatNextEvent(stats.nextEvent) : 'None', icon: TrophyIcon, color: 'text-tiko-red' },
            { name: 'Upcoming Events', value: (stats.upcomingGames + stats.practicesThisWeek).toString(), icon: CalendarIcon, color: 'text-tiko-blue' },
            { name: 'Team Size', value: stats.totalPlayers.toString(), icon: UserGroupIcon, color: 'text-tiko-green' },
            { name: 'This Week', value: stats.practicesThisWeek + ' practices', icon: ClockIcon, color: 'text-tiko-orange' },
          ],
          quickActions: [
            { label: 'Check Schedule', action: () => navigate('/schedule') },
            { label: 'View Messages', action: () => navigate('/messages') },
            { label: 'Team Roster', action: () => navigate('/roster') },
            { label: 'Practice Plans', action: () => navigate('/practice-plans') }
          ]
        };
      case 'player':
        return {
          title: 'Player Dashboard',
          stats: [
            { name: 'Next Event', value: stats.nextEvent ? formatNextEvent(stats.nextEvent) : 'None', icon: TrophyIcon, color: 'text-tiko-red' },
            { name: 'Practices This Week', value: stats.practicesThisWeek.toString(), icon: CalendarIcon, color: 'text-tiko-blue' },
            { name: 'Teammates', value: (stats.totalPlayers - 1).toString(), icon: UserGroupIcon, color: 'text-tiko-green' },
            { name: 'Upcoming Games', value: stats.upcomingGames.toString(), icon: ClockIcon, color: 'text-tiko-orange' },
          ],
          quickActions: [
            { label: 'View Schedule', action: () => navigate('/schedule') },
            { label: 'Check Messages', action: () => navigate('/messages') },
            { label: 'Practice Plans', action: () => navigate('/practice-plans') },
            { label: 'Team Roster', action: () => navigate('/roster') }
          ]
        };
      case 'team_owner':
        return {
          title: 'Team Owner Dashboard',
          stats: [
            { name: 'Upcoming Games', value: stats.upcomingGames.toString(), icon: TrophyIcon, color: 'text-tiko-red' },
            { name: 'Practices This Week', value: stats.practicesThisWeek.toString(), icon: CalendarIcon, color: 'text-tiko-blue' },
            { name: 'Next Event', value: stats.nextEvent ? formatNextEvent(stats.nextEvent) : 'None', icon: ClockIcon, color: 'text-tiko-green' },
            { name: 'Active Players', value: stats.totalPlayers.toString(), icon: UserGroupIcon, color: 'text-tiko-orange' },
          ],
          quickActions: [
            { label: 'Schedule Event', action: () => navigate('/schedule') },
            { label: 'Create Practice Plan', action: () => navigate('/practice-plans') },
            { label: 'Activity Library', action: () => navigate('/activity-library') },
            { label: 'Manage Team', action: () => navigate('/roster') }
          ]
        };
      case 'assistant_coach':
      default:
        return {
          title: 'Assistant Coach Dashboard',
          stats: [
            { name: 'Upcoming Games', value: stats.upcomingGames.toString(), icon: TrophyIcon, color: 'text-tiko-red' },
            { name: 'Practices This Week', value: stats.practicesThisWeek.toString(), icon: CalendarIcon, color: 'text-tiko-blue' },
            { name: 'Next Event', value: stats.nextEvent ? formatNextEvent(stats.nextEvent) : 'None', icon: ClockIcon, color: 'text-tiko-green' },
            { name: 'Active Players', value: stats.totalPlayers.toString(), icon: UserGroupIcon, color: 'text-tiko-orange' },
          ],
          quickActions: [
            { label: 'View Schedule', action: () => navigate('/schedule') },
            { label: 'Check Messages', action: () => navigate('/messages') },
            { label: 'Check Roster', action: () => navigate('/roster') },
            { label: 'Practice Plans', action: () => navigate('/practice-plans') }
          ]
        };
    }
  };

  const formatNextEvent = (event: Event) => {
    const eventDate = new Date(event.startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })
    };
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'game': return 'text-tiko-red';
      case 'practice': return 'text-tiko-blue';
      case 'meeting': return 'text-tiko-purple';
      default: return 'text-gray-500';
    }
  };

  if (teamLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Loading Dashboard...</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiko-blue"></div>
        </div>
      </div>
    );
  }

  if (teamError || error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {teamError || error}
          <button 
            onClick={loadDashboardData}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No team selected. Please select a team from the navigation.
        </div>
      </div>
    );
  }

  const content = getDashboardContent(currentRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <span>Refresh</span>
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {content.quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-between group"
              >
                <span>{action.label}</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <button 
              onClick={() => navigate('/schedule')}
              className="text-sm text-tiko-blue hover:text-blue-600 flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {getUpcomingEvents().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No upcoming events</p>
                <button 
                  onClick={() => navigate('/schedule')}
                  className="mt-2 text-tiko-blue hover:text-blue-600 text-sm"
                >
                  Schedule an event
                </button>
              </div>
            ) : (
              getUpcomingEvents().map((event) => {
                const dateTime = formatDateTime(event.startTime);
                return (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/schedule')}>
                    <div className={`w-2 h-2 mt-2 rounded-full ${getEventTypeColor(event.type).replace('text-', 'bg-')}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          event.type === 'game' ? 'bg-tiko-red text-white' : 
                          event.type === 'practice' ? 'bg-tiko-blue text-white' : 
                          'bg-gray-500 text-white'
                        }`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{dateTime.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{dateTime.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
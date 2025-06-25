import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { ScheduledPractice } from '../types';
import ApiService from '../services/api';

const ScheduledPractices: React.FC = () => {
  const [scheduledPractices, setScheduledPractices] = useState<ScheduledPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScheduledPractices();
  }, []);

  const loadScheduledPractices = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getScheduledPractices('team1');
      setScheduledPractices(data);
      setError(null);
    } catch (err) {
      setError('Failed to load scheduled practices');
      console.error('Error loading scheduled practices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePractice = async (practiceId: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled practice?')) {
      return;
    }

    try {
      await ApiService.deleteScheduledPractice(practiceId);
      await loadScheduledPractices();
    } catch (err) {
      setError('Failed to delete scheduled practice');
      console.error('Error deleting scheduled practice:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiko-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Practices</h1>
          <p className="text-gray-600 mt-1">Manage your team's practice schedule and plans</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Schedule Practice</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {scheduledPractices.map((practice) => (
              <div key={practice.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{practice.title}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatTime(practice.start_time)} - {formatTime(practice.end_time)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(practice.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{practice.location}</span>
                      </div>
                    </div>

                    {practice.practice_plan && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <PlayIcon className="w-4 h-4 text-tiko-blue" />
                          <span className="font-medium text-tiko-blue">{practice.practice_plan.name}</span>
                          <span className="text-sm text-gray-500">
                            ({practice.practice_plan.activities?.length || 0} activities)
                          </span>
                        </div>
                        
                        {practice.practice_plan.activities && practice.practice_plan.activities.length > 0 && (
                          <div className="flex flex-wrap gap-2 ml-6">
                            {practice.practice_plan.activities.slice(0, 3).map((activity) => (
                              <span
                                key={activity.id}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {activity.name}
                              </span>
                            ))}
                            {practice.practice_plan.activities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{practice.practice_plan.activities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {practice.notes && (
                      <p className="text-gray-600 text-sm">{practice.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-500 hover:text-tiko-blue transition-colors">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePractice(practice.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {scheduledPractices.length === 0 && (
              <div className="card text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No practices scheduled</h3>
                <p className="text-gray-500 mb-4">Schedule your first practice to get started</p>
                <button className="btn-primary">
                  Schedule Practice
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Practice Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Practices</span>
                <span className="font-semibold">{scheduledPractices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Week</span>
                <span className="font-semibold">
                  {scheduledPractices.filter(p => {
                    const practiceDate = new Date(p.date);
                    const now = new Date();
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return practiceDate >= weekStart && practiceDate <= weekEnd;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">With Plans</span>
                <span className="font-semibold">
                  {scheduledPractices.filter(p => p.practice_plan).length}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span>Create Practice Plan</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-3">
                <PlayIcon className="w-5 h-5 text-gray-500" />
                <span>Browse Activities</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPractices;
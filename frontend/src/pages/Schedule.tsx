import React, { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, ClockIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Event } from '../types';
import ApiService from '../services/api';
import EventModal from '../components/EventModal';

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getEvents('team1');
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await ApiService.deleteEvent(eventId);
      await loadEvents();
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  const handleEventSaved = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    loadEvents();
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'game':
        return 'bg-tiko-red text-white';
      case 'practice':
        return 'bg-tiko-blue text-white';
      case 'meeting':
        return 'bg-tiko-purple text-white';
      default:
        return 'bg-gray-500 text-white';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <button 
          onClick={handleAddEvent}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiko-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {events.map((event) => {
            const dateTime = formatDateTime(event.startTime);
            return (
              <div key={event.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <div className="flex items-center space-x-2">
                        {event.homeAway && (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            event.homeAway === 'home' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.homeAway.toUpperCase()}
                          </span>
                        )}
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1 text-gray-500 hover:text-tiko-blue transition-colors"
                          title="Edit event"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete event"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {dateTime.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {dateTime.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Games this month</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Practices this week</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Home games</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Away games</span>
                <span className="font-semibold">2</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
            <div className="space-y-2">
              <div className="p-3 bg-tiko-red/10 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Next Game</p>
                <p className="text-xs text-gray-600">Saturday 2:00 PM</p>
              </div>
              <div className="p-3 bg-tiko-blue/10 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Next Practice</p>
                <p className="text-xs text-gray-600">Monday 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={editingEvent}
        onSaved={handleEventSaved}
      />
    </div>
  );
};

export default Schedule;
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Event, PracticePlan } from '../types';
import ApiService from '../services/api';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSaved: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, onSaved }) => {
  const [formData, setFormData] = useState({
    teamId: 'team1',
    type: 'practice' as Event['type'],
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    opponent: '',
    homeAway: 'home' as 'home' | 'away',
    practice_plan_id: '',
    notes: ''
  });
  const [practicePlans, setPracticePlans] = useState<PracticePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPracticePlans();
      if (event) {
        setFormData({
          teamId: event.teamId,
          type: event.type,
          title: event.title,
          description: event.description || '',
          location: event.location,
          startTime: event.startTime,
          endTime: event.endTime,
          opponent: event.opponent || '',
          homeAway: event.homeAway || 'home',
          practice_plan_id: event.practice_plan_id || '',
          notes: event.notes || ''
        });
      } else {
        setFormData({
          teamId: 'team1',
          type: 'practice',
          title: '',
          description: '',
          location: '',
          startTime: '',
          endTime: '',
          opponent: '',
          homeAway: 'home',
          practice_plan_id: '',
          notes: ''
        });
      }
      setError(null);
    }
  }, [isOpen, event]);

  const loadPracticePlans = async () => {
    try {
      const plans = await ApiService.getPracticePlans('team1');
      setPracticePlans(plans);
    } catch (err) {
      console.error('Error loading practice plans:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const eventData = {
        ...formData,
        // Remove empty optional fields
        opponent: formData.type === 'game' ? formData.opponent : undefined,
        homeAway: formData.type === 'game' ? formData.homeAway : undefined,
        practice_plan_id: formData.type === 'practice' && formData.practice_plan_id ? formData.practice_plan_id : undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined
      };

      if (event) {
        await ApiService.updateEvent(event.id, eventData);
      } else {
        await ApiService.createEvent(eventData);
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateTimeForInput = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(0, 16);
  };

  const formatDateTimeForAPI = (inputValue: string) => {
    if (!inputValue) return '';
    return new Date(inputValue).toISOString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {event ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    required
                  >
                    <option value="practice">Practice</option>
                    <option value="game">Game</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    placeholder={formData.type === 'game' ? 'vs Team Name' : 'Event title'}
                    required
                  />
                </div>

                {/* Game-specific fields */}
                {formData.type === 'game' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opponent
                      </label>
                      <input
                        type="text"
                        name="opponent"
                        value={formData.opponent}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                        placeholder="Opponent team name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Home/Away
                      </label>
                      <select
                        name="homeAway"
                        value={formData.homeAway}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                      >
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Practice-specific fields */}
                {formData.type === 'practice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Practice Plan
                    </label>
                    <select
                      name="practice_plan_id"
                      value={formData.practice_plan_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    >
                      <option value="">No practice plan selected</option>
                      {practicePlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({plan.total_duration} min)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    placeholder="Event description"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    placeholder="Location"
                    required
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formatDateTimeForInput(formData.startTime)}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      startTime: formatDateTimeForAPI(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formatDateTimeForInput(formData.endTime)}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      endTime: formatDateTimeForAPI(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-tiko-blue text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiko-blue sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiko-blue sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
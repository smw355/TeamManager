// TODO: Redesign this modal for new practice plan structure
export default function PracticePlanModal() { return null; }

/*
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PracticePlan, PracticeActivity } from '../types';
import ApiService from '../services/api';

interface PracticePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PracticePlan | null;
  onSaved: () => void;
}

const PracticePlanModal: React.FC<PracticePlanModalProps> = ({ isOpen, onClose, plan, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_duration: '',
    activities: [] as PracticeActivity[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['warmup', 'technical', 'tactical', 'physical', 'cooldown'];

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setFormData({
          name: plan.name || '',
          description: plan.description || '',
          total_duration: plan.total_duration?.toString() || '',
          activities: plan.activities || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          total_duration: '',
          activities: []
        });
      }
      setError(null);
    }
  }, [isOpen, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const planData = {
        title: formData.title,
        description: formData.description,
        team_id: 'team1',
        duration: parseInt(formData.duration),
        date: formData.date,
        activities: formData.activities
      };

      if (plan) {
        await ApiService.updatePracticePlan(plan.id, planData);
      } else {
        await ApiService.createPracticePlan(planData);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save practice plan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: '',
      description: '',
      duration: 10,
      category: 'technical'
    };
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  };

  const updateActivity = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {plan ? 'Edit Practice Plan' : 'Create New Practice Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Practice Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="e.g., Ball Control Training"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Practice Date *
              </label>
              <input
                type="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              placeholder="Brief description of the practice focus..."
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Total Duration (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              required
              min="15"
              max="180"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              placeholder="90"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Practice Activities</h3>
              <button
                type="button"
                onClick={addActivity}
                className="btn-secondary flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.activities.map((activity, index) => (
                <div key={activity.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Activity Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={activity.name}
                          onChange={(e) => updateActivity(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                          placeholder="e.g., Warm-up Jog"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={activity.duration}
                            onChange={(e) => updateActivity(index, 'duration', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={activity.category}
                            onChange={(e) => updateActivity(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={activity.description}
                      onChange={(e) => updateActivity(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                      placeholder="Brief description of the activity..."
                    />
                  </div>
                </div>
              ))}

              {formData.activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No activities added yet. Click "Add Activity" to get started.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.date || !formData.duration}
              className="px-4 py-2 bg-tiko-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (plan ? 'Update Practice Plan' : 'Create Practice Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PracticePlanModal;
*/
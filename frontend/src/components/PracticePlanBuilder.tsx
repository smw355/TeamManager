import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PracticePlan, PracticeActivity } from '../types';
import ApiService from '../services/api';

interface PracticePlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PracticePlan | null;
  onSaved: () => void;
}

const PracticePlanBuilder: React.FC<PracticePlanBuilderProps> = ({ isOpen, onClose, plan, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_template: true
  });
  const [selectedActivities, setSelectedActivities] = useState<PracticeActivity[]>([]);
  const [availableActivities, setAvailableActivities] = useState<PracticeActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['warmup', 'technical', 'tactical', 'physical', 'cooldown', 'game', 'conditioning'];

  useEffect(() => {
    if (isOpen) {
      loadAvailableActivities();
      if (plan) {
        setFormData({
          name: plan.name || '',
          description: plan.description || '',
          is_template: plan.is_template !== false
        });
        setSelectedActivities(plan.activities || []);
      } else {
        setFormData({
          name: '',
          description: '',
          is_template: true
        });
        setSelectedActivities([]);
      }
      setError(null);
    }
  }, [isOpen, plan]);

  const loadAvailableActivities = async () => {
    try {
      const activities = await ApiService.getPracticeActivities();
      setAvailableActivities(activities);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load activities');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const totalDuration = selectedActivities.reduce((total, activity) => total + activity.duration, 0);
      
      const planData = {
        name: formData.name,
        description: formData.description,
        team_id: 'team1',
        total_duration: totalDuration,
        activity_ids: selectedActivities.map(a => a.id),
        is_template: formData.is_template,
        activities: selectedActivities.map((activity, index) => ({
          id: activity.id,
          order_index: index,
          custom_duration: activity.duration // Use default duration
        }))
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addActivity = (activity: PracticeActivity) => {
    if (!selectedActivities.find(a => a.id === activity.id)) {
      setSelectedActivities(prev => [...prev, activity]);
    }
  };

  const removeActivity = (activityId: string) => {
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId));
  };

  // moveActivity function removed for now - could be added later for reordering

  const filteredActivities = availableActivities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || activity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'warmup': return 'bg-yellow-100 text-yellow-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'tactical': return 'bg-green-100 text-green-800';
      case 'physical': return 'bg-red-100 text-red-800';
      case 'cooldown': return 'bg-purple-100 text-purple-800';
      case 'game': return 'bg-orange-100 text-orange-800';
      case 'conditioning': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Left Panel - Form */}
        <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {plan ? 'Edit Practice Plan' : 'Create Practice Plan'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="e.g., Basic Skills Development"
              />
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_template"
                checked={formData.is_template}
                onChange={(e) => handleInputChange('is_template', e.target.checked)}
                className="w-4 h-4 text-tiko-blue bg-gray-100 border-gray-300 rounded focus:ring-tiko-blue"
              />
              <label htmlFor="is_template" className="ml-2 text-sm text-gray-700">
                Save as reusable template
              </label>
            </div>

            {/* Selected Activities Summary */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Activities ({selectedActivities.length})</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600">
                  Total Duration: {selectedActivities.reduce((total, activity) => total + activity.duration, 0)} minutes
                </div>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {selectedActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-center justify-between py-1">
                      <span className="text-sm">{index + 1}. {activity.name} ({activity.duration}min)</span>
                      <button
                        type="button"
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                disabled={loading || !formData.name.trim() || selectedActivities.length === 0}
                className="px-4 py-2 bg-tiko-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Activity Library */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Library</h3>
          
          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{activity.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                        {activity.category}
                      </span>
                      <span className="text-sm text-gray-500">{activity.duration}min</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {activity.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {activity.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{activity.tags.length - 3} more</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {activity.min_players && activity.max_players && (
                        <span>{activity.min_players}-{activity.max_players} players • </span>
                      )}
                      {activity.difficulty_level} • {activity.age_group}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => addActivity(activity)}
                    disabled={selectedActivities.some(a => a.id === activity.id)}
                    className="ml-4 px-3 py-1 bg-tiko-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedActivities.some(a => a.id === activity.id) ? 'Added' : 'Add'}
                  </button>
                </div>
              </div>
            ))}
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No activities found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePlanBuilder;
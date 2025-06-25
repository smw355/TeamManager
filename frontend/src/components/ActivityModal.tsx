import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PracticeActivity } from '../types';
import ApiService from '../services/api';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: PracticeActivity | null;
  onSaved: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, activity, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 15,
    category: 'technical',
    difficulty_level: 'beginner',
    age_group: '',
    min_players: '',
    max_players: '',
    instructions: '',
    variations: '',
    is_public: true
  });
  const [tags, setTags] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['warmup', 'technical', 'tactical', 'physical', 'cooldown', 'game', 'conditioning'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    if (isOpen) {
      if (activity) {
        setFormData({
          name: activity.name || '',
          description: activity.description || '',
          duration: activity.duration || 15,
          category: activity.category || 'technical',
          difficulty_level: activity.difficulty_level || 'beginner',
          age_group: activity.age_group || '',
          min_players: activity.min_players?.toString() || '',
          max_players: activity.max_players?.toString() || '',
          instructions: activity.instructions || '',
          variations: activity.variations || '',
          is_public: activity.is_public !== false
        });
        setTags(activity.tags || []);
        setEquipment(activity.equipment_needed || []);
      } else {
        setFormData({
          name: '',
          description: '',
          duration: 15,
          category: 'technical',
          difficulty_level: 'beginner',
          age_group: '',
          min_players: '',
          max_players: '',
          instructions: '',
          variations: '',
          is_public: true
        });
        setTags([]);
        setEquipment([]);
      }
      setNewTag('');
      setNewEquipment('');
      setError(null);
    }
  }, [isOpen, activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const activityData = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        category: formData.category,
        tags: tags,
        equipment_needed: equipment,
        min_players: formData.min_players ? parseInt(formData.min_players) : undefined,
        max_players: formData.max_players ? parseInt(formData.max_players) : undefined,
        age_group: formData.age_group || undefined,
        difficulty_level: formData.difficulty_level,
        instructions: formData.instructions || undefined,
        variations: formData.variations || undefined,
        created_by: 'coach1', // TODO: Get from current user
        is_public: formData.is_public
      };

      if (activity) {
        await ApiService.updatePracticeActivity(activity.id, activityData);
      } else {
        await ApiService.createPracticeActivity(activityData);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment(prev => [...prev, newEquipment.trim()]);
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipmentToRemove: string) => {
    setEquipment(prev => prev.filter(eq => eq !== equipmentToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {activity ? 'Edit Activity' : 'Create New Activity'}
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="e.g., Cone Dribbling"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="Brief description of the activity..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  required
                  min="1"
                  max="120"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty *
                </label>
                <select
                  id="difficulty_level"
                  required
                  value={formData.difficulty_level}
                  onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Players and Age Group */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Players & Age Group</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="min_players" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Players
                </label>
                <input
                  type="number"
                  id="min_players"
                  min="1"
                  max="30"
                  value={formData.min_players}
                  onChange={(e) => handleInputChange('min_players', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <label htmlFor="max_players" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Players
                </label>
                <input
                  type="number"
                  id="max_players"
                  min="1"
                  max="30"
                  value={formData.max_players}
                  onChange={(e) => handleInputChange('max_players', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                  placeholder="e.g., 16"
                />
              </div>

              <div>
                <label htmlFor="age_group" className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group
                </label>
                <input
                  type="text"
                  id="age_group"
                  value={formData.age_group}
                  onChange={(e) => handleInputChange('age_group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                  placeholder="e.g., U10-U18"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tags</h3>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="Add tag (e.g., soccer, passing, youth)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-1 bg-tiko-blue text-white rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-200"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Equipment Needed</h3>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addEquipment)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="Add equipment (e.g., cones, soccer balls)"
              />
              <button
                type="button"
                onClick={addEquipment}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {equipment.map(eq => (
                <span key={eq} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {eq}
                  <button
                    type="button"
                    onClick={() => removeEquipment(eq)}
                    className="ml-1 hover:text-red-600"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Instructions & Variations</h3>
            
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                id="instructions"
                rows={4}
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="Detailed instructions for running this activity..."
              />
            </div>

            <div>
              <label htmlFor="variations" className="block text-sm font-medium text-gray-700 mb-1">
                Variations
              </label>
              <textarea
                id="variations"
                rows={3}
                value={formData.variations}
                onChange={(e) => handleInputChange('variations', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="Alternative ways to run this activity..."
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => handleInputChange('is_public', e.target.checked)}
              className="w-4 h-4 text-tiko-blue bg-gray-100 border-gray-300 rounded focus:ring-tiko-blue"
            />
            <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
              Make this activity public (visible to other coaches)
            </label>
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
              disabled={loading || !formData.name.trim() || !formData.description.trim()}
              className="px-4 py-2 bg-tiko-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (activity ? 'Update Activity' : 'Create Activity')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityModal;
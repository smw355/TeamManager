import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { PracticeActivity } from '../types';
import ApiService from '../services/api';
import ActivityModal from '../components/ActivityModal';

const ActivityLibrary: React.FC = () => {
  const [activities, setActivities] = useState<PracticeActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<PracticeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PracticeActivity | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const categories = ['warmup', 'technical', 'tactical', 'physical', 'cooldown', 'game', 'conditioning'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, searchTerm, selectedCategory, selectedDifficulty, selectedTag]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getPracticeActivities();
      setActivities(data);
      setError(null);
    } catch (err) {
      setError('Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        activity.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(activity => activity.difficulty_level === selectedDifficulty);
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(activity => activity.tags.includes(selectedTag));
    }

    setFilteredActivities(filtered);
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: PracticeActivity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity? It will be removed from any practice plans that use it.')) {
      return;
    }

    try {
      await ApiService.deletePracticeActivity(activityId);
      await loadActivities();
    } catch (err) {
      setError('Failed to delete activity');
      console.error('Error deleting activity:', err);
    }
  };

  const handleActivitySaved = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
    loadActivities();
  };

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    activities.forEach(activity => {
      activity.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedTag('');
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
          <h1 className="text-3xl font-bold text-gray-900">Activity Library</h1>
          <p className="text-gray-600 mt-1">Create and manage practice activities for your team</p>
        </div>
        <button
          onClick={handleAddActivity}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Activity</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {(searchTerm || selectedCategory || selectedDifficulty || selectedTag) && (
            <button
              onClick={clearFilters}
              className="text-sm text-tiko-blue hover:text-blue-600"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
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

          {/* Category Filter */}
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

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
          >
            <option value="">All Tags</option>
            {getAllTags().map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                    {activity.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{activity.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{activity.duration} min</span>
                  </div>
                  {activity.min_players && activity.max_players && (
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{activity.min_players}-{activity.max_players}</span>
                    </div>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty_level)}`}>
                    {activity.difficulty_level}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {activity.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center space-x-1">
                      <TagIcon className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                  {activity.tags.length > 4 && (
                    <span className="text-xs text-gray-500">+{activity.tags.length - 4} more</span>
                  )}
                </div>

                {/* Equipment */}
                {activity.equipment_needed && activity.equipment_needed.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Equipment:</span> {activity.equipment_needed.join(', ')}
                  </div>
                )}

                {/* Age Group */}
                {activity.age_group && (
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">Age Group:</span> {activity.age_group}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {activity.is_public ? 'Public' : 'Private'} • Created by {activity.created_by}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditActivity(activity)}
                  className="p-1 text-gray-500 hover:text-tiko-blue transition-colors"
                  title="Edit activity"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete activity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && !loading && (
        <div className="card text-center py-12">
          {searchTerm || selectedCategory || selectedDifficulty || selectedTag ? (
            <>
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
              <p className="text-gray-500 mb-4">Create your first activity to get started</p>
              <button
                onClick={handleAddActivity}
                className="btn-primary"
              >
                Create Activity
              </button>
            </>
          )}
        </div>
      )}

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={editingActivity}
        onSaved={handleActivitySaved}
      />
    </div>
  );
};

export default ActivityLibrary;
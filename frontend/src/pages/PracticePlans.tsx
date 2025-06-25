import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { PracticePlan } from '../types';
import ApiService from '../services/api';
import PracticePlanBuilder from '../components/PracticePlanBuilder';
import { useTeam } from '../contexts/TeamContext';

const PracticePlans: React.FC = () => {
  const { currentTeam, loading: teamLoading, error: teamError } = useTeam();
  const [practicePlans, setPracticePlans] = useState<PracticePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PracticePlan | null>(null);

  useEffect(() => {
    if (currentTeam) {
      loadPracticePlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam]);

  const loadPracticePlans = async () => {
    if (!currentTeam) return;
    
    try {
      setLoading(true);
      const data = await ApiService.getPracticePlans(currentTeam.id);
      setPracticePlans(data);
      setError(null);
    } catch (err) {
      setError('Failed to load practice plans');
      // eslint-disable-next-line no-console
      console.error('Error loading practice plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setIsBuilderOpen(true);
  };

  const handleEditPlan = (plan: PracticePlan) => {
    setEditingPlan(plan);
    setIsBuilderOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this practice plan?')) {
      return;
    }

    try {
      await ApiService.deletePracticePlan(planId);
      await loadPracticePlans();
    } catch (err) {
      setError('Failed to delete practice plan');
      console.error('Error deleting practice plan:', err);
    }
  };

  const handlePlanSaved = () => {
    setIsBuilderOpen(false);
    setEditingPlan(null);
    loadPracticePlans();
  };

  // formatDate removed since practice plans don't have dates (they're templates)

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'warmup':
        return 'bg-yellow-100 text-yellow-800';
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'tactical':
        return 'bg-green-100 text-green-800';
      case 'physical':
        return 'bg-red-100 text-red-800';
      case 'cooldown':
        return 'bg-purple-100 text-purple-800';
      case 'game':
        return 'bg-orange-100 text-orange-800';
      case 'conditioning':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (teamLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiko-blue"></div>
      </div>
    );
  }

  if (teamError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Practice Plans</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {teamError}
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Practice Plans</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No team selected. Please select a team from the navigation.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practice Plans</h1>
          <p className="text-gray-600 mt-1">Create and manage practice sessions for your team</p>
        </div>
        <button
          onClick={handleAddPlan}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Practice Plan</span>
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
            {practicePlans.map((plan) => (
              <div key={plan.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        <span>{plan.total_duration} min</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{plan.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <PlayIcon className="w-4 h-4" />
                        <span>{plan.activities?.length || 0} activities</span>
                      </div>
                      {plan.is_template && (
                        <div className="flex items-center space-x-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Template
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {plan.activities?.slice(0, 3).map((activity) => (
                        <span
                          key={activity.id}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}
                        >
                          {activity.name}
                        </span>
                      ))}
                      {(plan.activities?.length || 0) > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{(plan.activities?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="p-2 text-gray-500 hover:text-tiko-blue transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {practicePlans.length === 0 && (
              <div className="card text-center py-12">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No practice plans yet</h3>
                <p className="text-gray-500 mb-4">Create your first practice plan to get started</p>
                <button
                  onClick={handleAddPlan}
                  className="btn-primary"
                >
                  Create Practice Plan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Practice Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Plans</span>
                <span className="font-semibold">{practicePlans.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Activities</span>
                <span className="font-semibold">
                  {practicePlans.reduce((total, plan) => total + (plan.activities?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Duration</span>
                <span className="font-semibold">
                  {practicePlans.length > 0 
                    ? Math.round(practicePlans.reduce((total, plan) => total + plan.total_duration, 0) / practicePlans.length)
                    : 0
                  } min
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Categories</h2>
            <div className="space-y-2">
              {['warmup', 'technical', 'tactical', 'physical', 'cooldown', 'game', 'conditioning'].map((category) => {
                const count = practicePlans.reduce((total, plan) => 
                  total + (plan.activities?.filter(activity => activity.category === category).length || 0), 0
                );
                return (
                  <div key={category} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={handleAddPlan}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-3"
              >
                <PlusIcon className="w-5 h-5 text-gray-500" />
                <span>Create Practice Plan</span>
              </button>
              <a 
                href="/activity-library"
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-3"
              >
                <PlayIcon className="w-5 h-5 text-gray-500" />
                <span>Activity Library</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <PracticePlanBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        plan={editingPlan}
        onSaved={handlePlanSaved}
      />
    </div>
  );
};

export default PracticePlans;
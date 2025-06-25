import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTeam } from '../contexts/TeamContext';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onTeamCreated }) => {
  const { createTeam } = useTeam();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    age_group: '',
    season: '',
    description: ''
  });

  const sports = [
    'Soccer', 'Basketball', 'Baseball', 'Softball', 'Football', 'Volleyball', 
    'Tennis', 'Track & Field', 'Swimming', 'Hockey', 'Lacrosse', 'Wrestling',
    'Cross Country', 'Golf', 'Gymnastics', 'Other'
  ];

  const ageGroups = [
    'U6', 'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U21',
    'Elementary', 'Middle School', 'High School', 'College', 'Adult', 'Senior'
  ];

  const currentYear = new Date().getFullYear();
  const seasons = [
    `Spring ${currentYear}`,
    `Summer ${currentYear}`,
    `Fall ${currentYear}`,
    `Winter ${currentYear}`,
    `Spring ${currentYear + 1}`,
    `Summer ${currentYear + 1}`,
    `Fall ${currentYear + 1}`,
    `Winter ${currentYear + 1}`
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.sport || !formData.age_group) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createTeam({
        name: formData.name.trim(),
        sport: formData.sport,
        age_group: formData.age_group,
        season: formData.season || `${new Date().getFullYear()}`,
        description: formData.description.trim() || undefined
      });

      onTeamCreated();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        sport: '',
        age_group: '',
        season: '',
        description: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Team
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
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
                {/* Team Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    placeholder="e.g., Lightning Bolts, Eagles U12"
                    required
                  />
                </div>

                {/* Sport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sport *
                  </label>
                  <select
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    required
                  >
                    <option value="">Select a sport</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                {/* Age Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Group *
                  </label>
                  <select
                    name="age_group"
                    value={formData.age_group}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    required
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Season */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Season
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                  >
                    <option value="">Select season</option>
                    {seasons.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    placeholder="Optional team description or notes"
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
                {loading ? 'Creating...' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiko-blue sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
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

export default CreateTeamModal;
import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PlayerRelationship, User } from '../types';
import ApiService from '../services/api';
import { useTeam } from '../contexts/TeamContext';

interface PlayerRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerUserId?: string;
  existingRelationship?: PlayerRelationship;
  onSaved: () => void;
}

const PlayerRelationshipModal: React.FC<PlayerRelationshipModalProps> = ({
  isOpen,
  onClose,
  playerUserId,
  existingRelationship,
  onSaved
}) => {
  const { currentTeam } = useTeam();
  const [formData, setFormData] = useState({
    player_user_id: playerUserId || '',
    caregiver_user_id: '',
    relationship_type: 'parent' as 'parent' | 'guardian' | 'emergency_contact' | 'other',
    is_primary: false,
    can_pickup: false,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingRelationship) {
        setFormData({
          player_user_id: existingRelationship.player_user_id,
          caregiver_user_id: existingRelationship.caregiver_user_id,
          relationship_type: existingRelationship.relationship_type,
          is_primary: existingRelationship.is_primary,
          can_pickup: existingRelationship.can_pickup,
        });
        // TODO: Load caregiver user details
      } else {
        setFormData({
          player_user_id: playerUserId || '',
          caregiver_user_id: '',
          relationship_type: 'parent',
          is_primary: false,
          can_pickup: false,
        });
      }
      setSelectedCaregiver(null);
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen, existingRelationship, playerUserId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const results = await ApiService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search users');
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCaregiver = (user: User) => {
    setSelectedCaregiver(user);
    setFormData(prev => ({ ...prev, caregiver_user_id: user.id }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !formData.player_user_id || !formData.caregiver_user_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const relationshipData = {
        ...formData,
        team_id: currentTeam.id,
      };

      if (existingRelationship) {
        await ApiService.updatePlayerRelationship(existingRelationship.id, relationshipData);
      } else {
        await ApiService.createPlayerRelationship(relationshipData);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError('Failed to save relationship');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const relationshipTypes = [
    { value: 'parent', label: 'Parent' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'emergency_contact', label: 'Emergency Contact' },
    { value: 'other', label: 'Other' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {existingRelationship ? 'Edit Player Relationship' : 'Add Player Relationship'}
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

          {/* Caregiver Search */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Find Caregiver/Parent *
            </label>
            
            {selectedCaregiver ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{selectedCaregiver.name}</p>
                  <p className="text-sm text-gray-600">{selectedCaregiver.email}</p>
                  {selectedCaregiver.phone && (
                    <p className="text-sm text-gray-600">{selectedCaregiver.phone}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCaregiver(null);
                    setFormData(prev => ({ ...prev, caregiver_user_id: '' }));
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    className="px-4 py-2 bg-tiko-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectCaregiver(user)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <label htmlFor="relationship_type" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type *
            </label>
            <select
              id="relationship_type"
              value={formData.relationship_type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                relationship_type: e.target.value as any 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              required
            >
              {relationshipTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Permissions
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    is_primary: e.target.checked 
                  }))}
                  className="w-4 h-4 text-tiko-blue bg-gray-100 border-gray-300 rounded focus:ring-tiko-blue"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Primary contact for this player
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.can_pickup}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    can_pickup: e.target.checked 
                  }))}
                  className="w-4 h-4 text-tiko-blue bg-gray-100 border-gray-300 rounded focus:ring-tiko-blue"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Authorized to pick up player
                </span>
              </label>
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
              disabled={loading || !selectedCaregiver}
              className="px-4 py-2 bg-tiko-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (existingRelationship ? 'Update Relationship' : 'Add Relationship')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerRelationshipModal;
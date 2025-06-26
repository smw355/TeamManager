import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  UserGroupIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { Player, PlayerRelationship } from '../types';
import ApiService from '../services/api';
import PlayerModal from '../components/PlayerModal';
import PlayerRelationshipModal from '../components/PlayerRelationshipModal';
import { useTeam } from '../contexts/TeamContext';

const Roster: React.FC = () => {
  const { currentTeam, currentRole, loading: teamLoading, error: teamError } = useTeam();
  const [players, setPlayers] = useState<Player[]>([]);
  const [relationships, setRelationships] = useState<PlayerRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedPlayerForRelationship, setSelectedPlayerForRelationship] = useState<string | null>(null);

  useEffect(() => {
    if (currentTeam) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam]);

  const loadData = async () => {
    if (!currentTeam) return;
    
    try {
      setLoading(true);
      const [playersData, relationshipsData] = await Promise.all([
        ApiService.getTeamRoster(currentTeam.id),
        ApiService.getTeamRelationships(currentTeam.id)
      ]);
      setPlayers(playersData);
      setRelationships(relationshipsData);
      setError(null);
    } catch (err) {
      setError('Failed to load roster data');
      // eslint-disable-next-line no-console
      console.error('Error loading roster data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setIsModalOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setIsModalOpen(true);
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!window.confirm('Are you sure you want to remove this player from the roster?')) {
      return;
    }

    try {
      await ApiService.deletePlayer(currentTeam.id, playerId);
      await loadData();
    } catch (err) {
      setError('Failed to delete player');
      console.error('Error deleting player:', err);
    }
  };

  const handlePlayerSaved = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
    loadData();
  };

  const handleAddRelationship = (playerUserId: string) => {
    setSelectedPlayerForRelationship(playerUserId);
    setIsRelationshipModalOpen(true);
  };

  const handleRelationshipSaved = () => {
    setIsRelationshipModalOpen(false);
    setSelectedPlayerForRelationship(null);
    loadData();
  };

  const getPlayerRelationships = (playerUserId: string) => {
    return relationships.filter(rel => rel.player_user_id === playerUserId);
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'guardian': return 'bg-green-100 text-green-800';
      case 'emergency_contact': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position?.toLowerCase()) {
      case 'goalkeeper':
        return 'bg-tiko-orange text-white';
      case 'defender':
        return 'bg-tiko-blue text-white';
      case 'midfielder':
        return 'bg-tiko-green text-white';
      case 'forward':
        return 'bg-tiko-red text-white';
      default:
        return 'bg-gray-200 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900">Team Roster</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {teamError}
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Roster</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Team Roster</h1>
          <p className="text-gray-600 mt-1">Manage your team players and their information</p>
        </div>
        <button
          onClick={handleAddPlayer}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Player</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Age</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Family/Contacts</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => {
                    const age = player.birth_date ? 
                      new Date().getFullYear() - new Date(player.birth_date).getFullYear() : 
                      null;
                    const playerRelationships = player.user_id ? getPlayerRelationships(player.user_id) : [];
                    
                    return (
                      <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="text-lg font-bold text-tiko-blue">
                            {player.number || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">{player.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {player.position && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                              {player.position}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {age ? `${age} years` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {playerRelationships.length > 0 ? (
                              playerRelationships.map((relationship, index) => (
                                <div key={relationship.id} className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelationshipColor(relationship.relationship_type)}`}>
                                    {relationship.relationship_type.replace('_', ' ')}
                                  </span>
                                  <span className="text-sm text-gray-700">
                                    {relationship.caregiver_user?.name}
                                  </span>
                                  {relationship.is_primary && (
                                    <span className="text-xs text-blue-600 font-medium">Primary</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center space-x-2 text-gray-500">
                                <UserGroupIcon className="w-4 h-4" />
                                <span className="text-sm">No contacts linked</span>
                              </div>
                            )}
                            {player.user_id && (currentRole === 'team_owner' || currentRole === 'coach') && (
                              <button
                                onClick={() => handleAddRelationship(player.user_id!)}
                                className="text-xs text-tiko-blue hover:text-blue-600 flex items-center space-x-1 mt-1"
                              >
                                <LinkIcon className="w-3 h-3" />
                                <span>Add Contact</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPlayer(player)}
                              className="p-1 text-gray-500 hover:text-tiko-blue transition-colors"
                              title="Edit player"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            {(currentRole === 'team_owner' || currentRole === 'coach') && (
                              <button
                                onClick={() => handleDeletePlayer(player.id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete player"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {players.length === 0 && (
                <div className="text-center py-12">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No players added yet</p>
                  <button
                    onClick={handleAddPlayer}
                    className="mt-2 text-tiko-blue hover:text-blue-600"
                  >
                    Add your first player
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Roster Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Players</span>
                <span className="font-semibold">{players.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goalkeepers</span>
                <span className="font-semibold">
                  {players.filter(p => p.position?.toLowerCase() === 'goalkeeper').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Defenders</span>
                <span className="font-semibold">
                  {players.filter(p => p.position?.toLowerCase() === 'defender').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Midfielders</span>
                <span className="font-semibold">
                  {players.filter(p => p.position?.toLowerCase() === 'midfielder').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Forwards</span>
                <span className="font-semibold">
                  {players.filter(p => p.position?.toLowerCase() === 'forward').length}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-500" />
                <span>Contact All Parents</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span>Check Availability</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={editingPlayer}
        onSaved={handlePlayerSaved}
      />

      <PlayerRelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        playerUserId={selectedPlayerForRelationship || undefined}
        onSaved={handleRelationshipSaved}
      />
    </div>
  );
};

export default Roster;
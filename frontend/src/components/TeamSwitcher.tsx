import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  PlusIcon, 
  CheckIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useTeam } from '../contexts/TeamContext';
import { TeamRole } from '../types';
import CreateTeamModal from './CreateTeamModal';

interface TeamSwitcherProps {
  onTeamManage?: () => void;
}

const TeamSwitcher: React.FC<TeamSwitcherProps> = ({ onTeamManage }) => {
  const { currentTeam, userTeams, currentRole, switchTeam } = useTeam();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'team_owner': return 'text-purple-600 bg-purple-100';
      case 'coach': return 'text-blue-600 bg-blue-100';
      case 'assistant_coach': return 'text-teal-600 bg-teal-100';
      case 'player': return 'text-green-600 bg-green-100';
      case 'player_contact': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case 'team_owner': return 'Owner';
      case 'coach': return 'Coach';
      case 'assistant_coach': return 'Asst. Coach';
      case 'player': return 'Player';
      case 'player_contact': return 'Parent/Guardian';
      default: return role;
    }
  };

  const handleTeamSwitch = async (teamId: string) => {
    await switchTeam(teamId);
    setIsOpen(false);
  };

  const handleCreateTeam = () => {
    setIsCreateModalOpen(true);
    setIsOpen(false);
  };

  const handleTeamCreated = () => {
    setIsCreateModalOpen(false);
  };

  if (!currentTeam) {
    return (
      <div className="flex items-center space-x-2">
        <UserGroupIcon className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">No team selected</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-0"
      >
        <div className="flex-shrink-0">
          <UserGroupIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentTeam.name}
          </p>
          <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleColor(currentRole || 'player')}`}>
            {getRoleLabel(currentRole || 'player')}
          </p>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Switch Team</h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {userTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSwitch(team.id)}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {team.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {team.sport} • {team.age_group}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(team.user_role)}`}>
                        {getRoleLabel(team.user_role)}
                      </span>
                    </div>
                  </div>
                  {currentTeam?.id === team.id && (
                    <CheckIcon className="w-4 h-4 text-tiko-blue ml-2" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 space-y-1">
              <button
                onClick={handleCreateTeam}
                className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create New Team</span>
              </button>
              
              {onTeamManage && (currentRole === 'team_owner' || currentRole === 'coach') && (
                <button
                  onClick={() => {
                    onTeamManage();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Manage Team</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
};

export default TeamSwitcher;
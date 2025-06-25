import React, { useState } from 'react';
import { 
  BellIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { User, UserRole } from '../../types';
import { useAuth } from '../../contexts/LocalAuthContext';
import { useTeam } from '../../contexts/TeamContext';
import TeamSwitcher from '../TeamSwitcher';

interface TopNavProps {
  user: User;
  onRoleChange?: (role: UserRole) => void;
  onTikoOpen: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ user, onRoleChange: _onRoleChange, onTikoOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuth();
  const { currentRole } = useTeam();

  const handleSignOut = async () => {
    try {
      logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const roleColors = {
    team_owner: 'bg-purple-600 text-white',
    coach: 'bg-tiko-blue text-white',
    assistant_coach: 'bg-teal-600 text-white',
    player: 'bg-tiko-green text-white',
    player_contact: 'bg-tiko-orange text-white',
  };

  const roleLabels = {
    team_owner: 'Team Owner',
    coach: 'Coach',
    assistant_coach: 'Assistant Coach',
    player: 'Player',
    player_contact: 'Parent/Guardian',
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user.name.split(' ')[0]}!
          </h1>
          {currentRole && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[currentRole]}`}>
              {roleLabels[currentRole]}
            </span>
          )}
        </div>
        <TeamSwitcher />
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onTikoOpen}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-tiko-blue to-tiko-green text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
          <span className="font-medium">Ask Tiko</span>
        </button>
        
        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-tiko-red rounded-full"></span>
        </button>
        
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <UserCircleIcon className="w-8 h-8" />
            )}
            <span className="font-medium">{user.name}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile Settings
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Team Settings
              </button>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNav;
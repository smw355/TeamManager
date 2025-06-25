import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { TeamRole } from '../../types';

interface SidebarProps {
  userRole: TeamRole;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['team_owner', 'coach', 'assistant_coach', 'player', 'player_contact'] },
    { name: 'Schedule', href: '/schedule', icon: CalendarIcon, roles: ['team_owner', 'coach', 'assistant_coach', 'player', 'player_contact'] },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon, roles: ['team_owner', 'coach', 'assistant_coach', 'player', 'player_contact'] },
    { name: 'Roster', href: '/roster', icon: UserGroupIcon, roles: ['team_owner', 'coach', 'assistant_coach', 'player', 'player_contact'] },
    { name: 'Practice Plans', href: '/practice-plans', icon: ClipboardDocumentListIcon, roles: ['team_owner', 'coach', 'assistant_coach'] },
    { name: 'Activity Library', href: '/activity-library', icon: BookOpenIcon, roles: ['team_owner', 'coach', 'assistant_coach'] },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-tiko-blue to-tiko-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Tiko</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-tiko-blue text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          AI-powered team management
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
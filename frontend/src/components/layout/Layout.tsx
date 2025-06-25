import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import TikoModal from '../TikoModal';
import { User } from '../../types';
import { useTeam } from '../../contexts/TeamContext';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, children }) => {
  const [isTikoOpen, setIsTikoOpen] = useState(false);
  const { currentRole, currentTeam, loading } = useTeam();

  // Show loading if team is still loading
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-lg">Loading teams...</div>
      </div>
    );
  }

  // Don't render sidebar if no role is available yet
  if (!currentRole || !currentTeam) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav 
            user={user} 
            onTikoOpen={() => setIsTikoOpen(true)}
          />
          
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
        
        <TikoModal 
          isOpen={isTikoOpen}
          onClose={() => setIsTikoOpen(false)}
          user={user}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={currentRole} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          user={user} 
          onTikoOpen={() => setIsTikoOpen(true)}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      
      <TikoModal 
        isOpen={isTikoOpen}
        onClose={() => setIsTikoOpen(false)}
        user={user}
      />
    </div>
  );
};

export default Layout;
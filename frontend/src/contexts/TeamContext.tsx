import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, TeamWithMembership, TeamRole, UserTeamMembership } from '../types';
import ApiService from '../services/api';

interface TeamContextType {
  currentTeam: TeamWithMembership | null;
  userTeams: TeamWithMembership[];
  currentRole: TeamRole | null;
  loading: boolean;
  error: string | null;
  switchTeam: (teamId: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
  createTeam: (teamData: Partial<Team>) => Promise<Team>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

interface TeamProviderProps {
  children: React.ReactNode;
  userId: string;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children, userId }) => {
  const [currentTeam, setCurrentTeam] = useState<TeamWithMembership | null>(null);
  const [userTeams, setUserTeams] = useState<TeamWithMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUserTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // eslint-disable-next-line no-console
      console.log('TeamContext: Loading teams for user:', userId);
      const teams = await ApiService.getUserTeams(userId);
      // eslint-disable-next-line no-console
      console.log('TeamContext: Loaded teams:', teams);
      setUserTeams(teams);
      
      // Set current team from localStorage or default to first team
      const savedTeamId = localStorage.getItem('currentTeamId');
      // eslint-disable-next-line no-console
      console.log('TeamContext: Saved team ID from localStorage:', savedTeamId);
      const defaultTeam = savedTeamId 
        ? teams.find(t => t.id === savedTeamId) || teams[0]
        : teams[0];
      
      // eslint-disable-next-line no-console
      console.log('TeamContext: Setting default team:', defaultTeam);
      if (defaultTeam) {
        setCurrentTeam(defaultTeam);
        localStorage.setItem('currentTeamId', defaultTeam.id);
        // eslint-disable-next-line no-console
        console.log('TeamContext: Current team set to:', defaultTeam.name, 'with role:', defaultTeam.user_role);
      } else {
        // eslint-disable-next-line no-console
        console.log('TeamContext: No teams found for user');
      }
    } catch (err) {
      setError('Failed to load teams');
      // eslint-disable-next-line no-console
      console.error('TeamContext: Error loading user teams:', err);
    } finally {
      setLoading(false);
      // eslint-disable-next-line no-console
      console.log('TeamContext: Loading complete. Current team:', currentTeam?.name);
    }
  };

  const switchTeam = async (teamId: string) => {
    const team = userTeams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      localStorage.setItem('currentTeamId', teamId);
    }
  };

  const refreshTeams = async () => {
    await loadUserTeams();
  };

  const createTeam = async (teamData: Partial<Team>): Promise<Team> => {
    try {
      const newTeam = await ApiService.createTeam({
        ...teamData,
        owner_id: userId
      });
      
      // Refresh teams list to include the new team
      await refreshTeams();
      
      // Switch to the new team
      await switchTeam(newTeam.id);
      
      return newTeam;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creating team:', err);
      throw err;
    }
  };

  const currentRole = currentTeam?.user_role || null;

  const value: TeamContextType = {
    currentTeam,
    userTeams,
    currentRole,
    loading,
    error,
    switchTeam,
    refreshTeams,
    createTeam
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContext;
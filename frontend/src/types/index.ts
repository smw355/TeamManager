export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export type TeamRole = 'team_owner' | 'coach' | 'assistant_coach' | 'player' | 'player_contact';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UserTeamMembership {
  id: string;
  user_id: string;
  team_id: string;
  role: TeamRole;
  player_id?: string; // For player_contact role - which player they're associated with
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  age_group: string;
  season: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamWithMembership extends Team {
  user_role: TeamRole;
  membership_id: string;
}

// Legacy type for backward compatibility
export type UserRole = TeamRole;

export interface Player {
  id: string;
  name: string;
  number?: number;
  position?: string;
  parent_ids?: string[];
  team_id: string;
  birth_date?: string;
  emergency_contact?: string;
  created_at?: string;
  // Computed properties for compatibility
  parentIds?: string[];
  teamId?: string;
  birthDate?: string;
  emergencyContact?: string;
}

export interface Event {
  id: string;
  teamId: string;
  type: 'game' | 'practice' | 'meeting' | 'other';
  title: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  opponent?: string;
  homeAway?: 'home' | 'away';
  practice_plan_id?: string;
  practice_plan?: PracticePlan;
  notes?: string;
  attendance?: Record<string, boolean>;
  snackDuty?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  teamId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  type: 'team' | 'direct' | 'ai';
  recipientIds?: string[];
  isAiMessage?: boolean;
}

export interface TikoContext {
  user: User;
  team: Team;
  upcomingEvents: Event[];
  recentMessages: Message[];
  players: Player[];
}

export interface ScheduledPractice {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  team_id: string;
  practice_plan_id?: string;
  practice_plan?: PracticePlan;
  notes?: string;
  attendance?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface PracticePlan {
  id: string;
  name: string;
  description: string;
  team_id: string;
  total_duration: number; // calculated from activities
  activity_ids: string[];
  activities?: PracticeActivity[]; // populated when needed
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeActivity {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown' | 'game' | 'conditioning';
  tags: string[]; // e.g., ['soccer', 'passing', 'youth', 'beginner']
  equipment_needed?: string[];
  min_players?: number;
  max_players?: number;
  age_group?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  variations?: string;
  created_by: string;
  is_public: boolean; // can be shared across teams
  created_at: string;
  updated_at: string;
}

export interface PlanActivity {
  id: string;
  practice_plan_id: string;
  activity_id: string;
  order_index: number;
  custom_duration?: number; // override default duration
  custom_notes?: string;
}
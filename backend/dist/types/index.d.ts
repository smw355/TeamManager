export interface User {
    id: string;
    email: string;
    name: string;
    role: 'coach' | 'parent' | 'player' | 'assistant_coach';
    team_id?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Team {
    id: string;
    name: string;
    sport: string;
    season: string;
    coach_id: string;
    created_at: Date;
    updated_at: Date;
}
export interface Player {
    id: string;
    team_id: string;
    name: string;
    number: number;
    position: string;
    age: number;
    parent_id?: string;
    stats: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
export interface Event {
    id: string;
    team_id: string;
    title: string;
    type: 'game' | 'practice' | 'meeting';
    date: Date;
    location: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Message {
    id: string;
    team_id: string;
    user_id: string;
    content: string;
    type: 'text' | 'ai_response';
    created_at: Date;
}
export interface AuthRequest extends Request {
    user?: User;
}
export interface ApiError {
    message: string;
    code: string;
    status: number;
    details?: any;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}
//# sourceMappingURL=index.d.ts.map
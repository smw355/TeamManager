const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('tiko_token', token);
    } else {
      localStorage.removeItem('tiko_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('tiko_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(error.error?.message || error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ success: boolean; data: { token: string; user: any } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.success && response.data) {
      this.setToken(response.data.token);
      return response.data;
    }
    throw new Error('Login failed');
  }

  async demoLogin(role: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(userData: { email: string; password: string; name: string }) {
    const response = await this.request<{ success: boolean; data: { token: string; user: any } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.success && response.data) {
      this.setToken(response.data.token);
      return response.data;
    }
    throw new Error('Registration failed');
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; data: { user: any } }>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Roster endpoints
  async getTeamRoster(teamId: string) {
    return this.request<any[]>(`/roster/${teamId}/players`);
  }

  async createPlayer(teamId: string, playerData: any) {
    return this.request<any>(`/roster/${teamId}/players`, {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async updatePlayer(teamId: string, playerId: string, playerData: any) {
    return this.request<any>(`/roster/${teamId}/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(playerData),
    });
  }

  async deletePlayer(teamId: string, playerId: string) {
    return this.request<{ message: string }>(`/roster/${teamId}/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  // Message endpoints
  async getMessages(teamId: string, limit = 50, offset = 0) {
    return this.request<any[]>(`/messages/${teamId}?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(teamId: string, content: string, type = 'text') {
    return this.request<any>(`/messages/${teamId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  // Practice Activities endpoints
  async getPracticeActivities(filters?: { search?: string; category?: string; tags?: string[] }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));
    
    const queryString = params.toString();
    return this.request<any[]>(`/practice-activities${queryString ? '?' + queryString : ''}`);
  }

  async createPracticeActivity(activityData: any) {
    return this.request<any>('/practice-activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async getPracticeActivity(activityId: string) {
    return this.request<any>(`/practice-activities/${activityId}`);
  }

  async updatePracticeActivity(activityId: string, activityData: any) {
    return this.request<any>(`/practice-activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  async deletePracticeActivity(activityId: string) {
    return this.request<{ success: boolean; message: string }>(`/practice-activities/${activityId}`, {
      method: 'DELETE',
    });
  }

  // Practice Plans endpoints
  async getPracticePlans(teamId: string) {
    return this.request<any[]>(`/practice-plans/team/${teamId}`);
  }

  async createPracticePlan(planData: any) {
    return this.request<any>('/practice-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async getPracticePlan(planId: string) {
    return this.request<any>(`/practice-plans/${planId}`);
  }

  async updatePracticePlan(planId: string, planData: any) {
    return this.request<any>(`/practice-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deletePracticePlan(planId: string) {
    return this.request<{ success: boolean; message: string }>(`/practice-plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Scheduled Practices endpoints
  async getScheduledPractices(teamId: string) {
    return this.request<any[]>(`/scheduled-practices/team/${teamId}`);
  }

  async createScheduledPractice(practiceData: any) {
    return this.request<any>('/scheduled-practices', {
      method: 'POST',
      body: JSON.stringify(practiceData),
    });
  }

  async getScheduledPractice(practiceId: string) {
    return this.request<any>(`/scheduled-practices/${practiceId}`);
  }

  async updateScheduledPractice(practiceId: string, practiceData: any) {
    return this.request<any>(`/scheduled-practices/${practiceId}`, {
      method: 'PUT',
      body: JSON.stringify(practiceData),
    });
  }

  async deleteScheduledPractice(practiceId: string) {
    return this.request<{ success: boolean; message: string }>(`/scheduled-practices/${practiceId}`, {
      method: 'DELETE',
    });
  }

  // Events endpoints
  async getEvents(teamId: string) {
    return this.request<any[]>(`/events/team/${teamId}`);
  }

  async createEvent(eventData: any) {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getEvent(eventId: string) {
    return this.request<any>(`/events/${eventId}`);
  }

  async updateEvent(eventId: string, eventData: any) {
    return this.request<any>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request<{ success: boolean; message: string }>(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // AI Chat endpoint
  async chatWithTiko(message: string, userRole: string, context: any) {
    return this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, userRole, context }),
    });
  }

  // Team Management endpoints
  async getUserTeams(userId: string) {
    return this.request<any[]>(`/users/${userId}/teams`);
  }

  async createTeam(teamData: any) {
    return this.request<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async getTeam(teamId: string) {
    return this.request<any>(`/teams/${teamId}`);
  }

  async updateTeam(teamId: string, teamData: any) {
    return this.request<any>(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(teamId: string) {
    return this.request<{ success: boolean; message: string }>(`/teams/${teamId}`, {
      method: 'DELETE',
    });
  }

  async addTeamMember(teamId: string, memberData: any) {
    return this.request<any>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateTeamMember(teamId: string, memberId: string, memberData: any) {
    return this.request<any>(`/teams/${teamId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async removeTeamMember(teamId: string, memberId: string) {
    return this.request<{ success: boolean; message: string }>(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return fetch('http://localhost:8000/health').then(res => res.json());
  }
}

const apiService = new ApiService();
export default apiService;
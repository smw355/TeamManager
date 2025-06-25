const http = require('http');
const url = require('url');

// Mock data stores

// Users (without roles - roles are team-specific)
let users = [
  {
    id: 'user1',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar: null,
    phone: '+1-555-0123',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: 'user2',
    email: 'coach@example.com',
    name: 'Sarah Johnson',
    avatar: null,
    phone: '+1-555-0124',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  }
];

// Teams
let teams = [
  {
    id: 'team1',
    name: 'Lightning Bolts',
    sport: 'Soccer',
    age_group: 'U12',
    season: '2025',
    description: 'Competitive youth soccer team',
    owner_id: 'user1',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: 'team2',
    name: 'Eagles Basketball',
    sport: 'Basketball',
    age_group: 'Middle School',
    season: 'Winter 2025',
    description: 'School basketball team',
    owner_id: 'user2',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  }
];

// User Team Memberships
let userTeamMemberships = [
  {
    id: 'membership1',
    user_id: 'user1',
    team_id: 'team1',
    role: 'team_owner',
    player_id: null,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: 'membership2',
    user_id: 'user1',
    team_id: 'team2',
    role: 'player',
    player_id: 'player1',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: 'membership3',
    user_id: 'user2',
    team_id: 'team1',
    role: 'coach',
    player_id: null,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: 'membership4',
    user_id: 'user2',
    team_id: 'team2',
    role: 'team_owner',
    player_id: null,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  }
];

let players = [
  {
    id: '1',
    name: 'Alex Johnson',
    number: 10,
    position: 'Forward',
    team_id: 'team1',
    birth_date: '2010-05-15',
    emergency_contact: 'parent@example.com'
  },
  {
    id: '2', 
    name: 'Sam Williams',
    number: 7,
    position: 'Midfielder',
    team_id: 'team1',
    birth_date: '2011-03-22',
    emergency_contact: 'parent2@example.com'
  }
];

// Practice Activities Library
let practiceActivities = [
  {
    id: '1',
    name: 'Dynamic Warm-up',
    description: 'Movement-based warm-up with light ball touches',
    duration: 15,
    category: 'warmup',
    tags: ['soccer', 'warmup', 'movement', 'youth'],
    equipment_needed: ['cones', 'soccer balls'],
    min_players: 8,
    max_players: 20,
    age_group: 'U12-U16',
    difficulty_level: 'beginner',
    instructions: 'Players jog in pairs, incorporating high knees, butt kicks, and side shuffles. Add light ball touches in the final 5 minutes.',
    variations: 'Can be done without ball for pure fitness, or add dynamic stretching',
    created_by: 'coach1',
    is_public: true,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '2',
    name: 'Cone Dribbling',
    description: 'Individual ball control through cone course',
    duration: 20,
    category: 'technical',
    tags: ['soccer', 'dribbling', 'ball control', 'individual'],
    equipment_needed: ['cones', 'soccer balls'],
    min_players: 1,
    max_players: 16,
    age_group: 'U8-U18',
    difficulty_level: 'beginner',
    instructions: 'Set up cones in a line 2 yards apart. Players dribble through using both feet, focusing on close control.',
    variations: 'Add time pressure, use different surfaces of foot, add turns at the end',
    created_by: 'coach1',
    is_public: true,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '3',
    name: 'Passing Squares',
    description: 'Short passing in small groups with movement',
    duration: 25,
    category: 'technical',
    tags: ['soccer', 'passing', 'movement', 'teamwork'],
    equipment_needed: ['cones', 'soccer balls'],
    min_players: 4,
    max_players: 16,
    age_group: 'U10-U18',
    difficulty_level: 'intermediate',
    instructions: 'Groups of 4 in 10x10 yard squares. Pass and follow, focusing on first touch and accuracy.',
    variations: 'Add pressure, limit touches, add through balls',
    created_by: 'coach1',
    is_public: true,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '4',
    name: '4v4 Scrimmage',
    description: 'Small-sided game focusing on specific tactics',
    duration: 30,
    category: 'game',
    tags: ['soccer', 'scrimmage', 'tactics', 'game'],
    equipment_needed: ['small goals', 'soccer balls', 'pinnies'],
    min_players: 8,
    max_players: 12,
    age_group: 'U10-U18',
    difficulty_level: 'intermediate',
    instructions: 'Small-sided games on 30x20 yard field. Focus on possession and quick passing.',
    variations: 'Add specific rules like maximum touches, must pass before shooting',
    created_by: 'coach1',
    is_public: true,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '5',
    name: 'Cool Down Stretching',
    description: 'Static stretching and recovery',
    duration: 10,
    category: 'cooldown',
    tags: ['soccer', 'stretching', 'recovery', 'cooldown'],
    equipment_needed: [],
    min_players: 1,
    max_players: 25,
    age_group: 'U8-U18',
    difficulty_level: 'beginner',
    instructions: 'Static stretches focusing on hamstrings, quads, calves, and hip flexors. Hold each stretch for 30 seconds.',
    variations: 'Add foam rolling if available',
    created_by: 'coach1',
    is_public: true,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '6',
    name: 'Sprint Intervals',
    description: 'High-intensity conditioning with recovery periods',
    duration: 20,
    category: 'conditioning',
    tags: ['soccer', 'fitness', 'sprints', 'conditioning'],
    equipment_needed: ['cones'],
    min_players: 1,
    max_players: 20,
    age_group: 'U14-U18',
    difficulty_level: 'advanced',
    instructions: '6 sets of 30-yard sprints with 90 seconds rest between sets. Focus on proper form.',
    variations: 'Change distance, add ball work, pyramid sets',
    created_by: 'coach1',
    is_public: true,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  }
];

// Practice Plans (templates)
let practicePlans = [
  {
    id: '1',
    name: 'Basic Skills Development',
    description: 'Focus on fundamental ball control and passing',
    team_id: 'team1',
    total_duration: 90,
    activity_ids: ['1', '2', '3', '5'],
    is_template: false,
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '2',
    name: 'Game Preparation',
    description: 'Match-focused training with scrimmage',
    team_id: 'team1',
    total_duration: 75,
    activity_ids: ['1', '3', '4', '5'],
    is_template: false,
    created_at: '2025-06-24T11:00:00Z',
    updated_at: '2025-06-24T11:00:00Z'
  }
];

// Plan Activities (junction table)
let planActivities = [
  // Basic Skills Development plan
  { id: '1', practice_plan_id: '1', activity_id: '1', order_index: 0, custom_duration: 15 },
  { id: '2', practice_plan_id: '1', activity_id: '2', order_index: 1, custom_duration: 25 },
  { id: '3', practice_plan_id: '1', activity_id: '3', order_index: 2, custom_duration: 40 },
  { id: '4', practice_plan_id: '1', activity_id: '5', order_index: 3, custom_duration: 10 },
  
  // Game Preparation plan
  { id: '5', practice_plan_id: '2', activity_id: '1', order_index: 0, custom_duration: 15 },
  { id: '6', practice_plan_id: '2', activity_id: '3', order_index: 1, custom_duration: 20 },
  { id: '7', practice_plan_id: '2', activity_id: '4', order_index: 2, custom_duration: 30 },
  { id: '8', practice_plan_id: '2', activity_id: '5', order_index: 3, custom_duration: 10 }
];

// Events (practices and games)
let events = [
  {
    id: '1',
    teamId: 'team1',
    type: 'game',
    title: 'vs Eagles',
    description: 'Home game against Eagles',
    location: 'Central Park Field 1',
    startTime: '2025-06-27T14:00:00Z',
    endTime: '2025-06-27T16:00:00Z',
    opponent: 'Eagles',
    homeAway: 'home',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '2',
    teamId: 'team1',
    type: 'practice',
    title: 'Skills Training',
    description: 'Focus on ball control and passing',
    location: 'School Gym',
    startTime: '2025-06-25T17:00:00Z',
    endTime: '2025-06-25T18:30:00Z',
    practice_plan_id: '1',
    notes: 'Weather backup location',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '3',
    teamId: 'team1',
    type: 'game',
    title: 'vs Hawks',
    description: 'Away game at Hawks Stadium',
    location: 'Hawks Stadium',
    startTime: '2025-06-29T10:00:00Z',
    endTime: '2025-06-29T12:00:00Z',
    opponent: 'Hawks',
    homeAway: 'away',
    created_at: '2025-06-24T11:00:00Z',
    updated_at: '2025-06-24T11:00:00Z'
  },
  {
    id: '4',
    teamId: 'team1',
    type: 'practice',
    title: 'Game Preparation',
    description: 'Tactical preparation for upcoming match',
    location: 'Field B',
    startTime: '2025-06-26T16:00:00Z',
    endTime: '2025-06-26T17:15:00Z',
    practice_plan_id: '2',
    notes: 'Prepare for Saturday match vs Hawks',
    created_at: '2025-06-24T11:00:00Z',
    updated_at: '2025-06-24T11:00:00Z'
  }
];

// Scheduled Practices (kept for backwards compatibility)
let scheduledPractices = [
  {
    id: '1',
    title: 'Tuesday Skills Training',
    date: '2025-06-25',
    start_time: '16:00',
    end_time: '17:30',
    location: 'Field A',
    team_id: 'team1',
    practice_plan_id: '1',
    notes: 'Focus on fundamentals, weather permitting',
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '2',
    title: 'Thursday Game Prep',
    date: '2025-06-27',
    start_time: '16:00',
    end_time: '17:15',
    location: 'Field B',
    team_id: 'team1',
    practice_plan_id: '2',
    notes: 'Prepare for Saturday match vs Eagles',
    created_at: '2025-06-24T11:00:00Z',
    updated_at: '2025-06-24T11:00:00Z'
  }
];

let nextUserId = 3;
let nextTeamId = 3;
let nextMembershipId = 5;
let nextPlayerId = 3;
let nextActivityId = 7;
let nextPlanId = 3;
let nextPlanActivityId = 9;
let nextScheduledPracticeId = 3;
let nextEventId = 5;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${req.method} ${pathname}`);

  // Auth endpoints (same as before)
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    handleLogin(req, res);
  } else if (req.method === 'GET' && pathname === '/api/auth/me') {
    handleCurrentUser(req, res);
  }
  
  // Roster endpoints (same as before)
  else if (req.method === 'GET' && pathname.match(/^\/api\/roster\/(.+)\/players$/)) {
    handleGetPlayers(req, res, pathname);
  } else if (req.method === 'POST' && pathname.match(/^\/api\/roster\/(.+)\/players$/)) {
    handleCreatePlayer(req, res, pathname);
  } else if (req.method === 'PUT' && pathname.match(/^\/api\/roster\/(.+)\/players\/(.+)$/)) {
    handleUpdatePlayer(req, res, pathname);
  } else if (req.method === 'DELETE' && pathname.match(/^\/api\/roster\/(.+)\/players\/(.+)$/)) {
    handleDeletePlayer(req, res, pathname);
  }
  
  // Practice Activities endpoints
  else if (req.method === 'GET' && pathname === '/api/practice-activities') {
    handleGetPracticeActivities(req, res, parsedUrl.query);
  } else if (req.method === 'POST' && pathname === '/api/practice-activities') {
    handleCreatePracticeActivity(req, res);
  } else if (req.method === 'GET' && pathname.match(/^\/api\/practice-activities\/(.+)$/)) {
    handleGetPracticeActivity(req, res, pathname);
  } else if (req.method === 'PUT' && pathname.match(/^\/api\/practice-activities\/(.+)$/)) {
    handleUpdatePracticeActivity(req, res, pathname);
  } else if (req.method === 'DELETE' && pathname.match(/^\/api\/practice-activities\/(.+)$/)) {
    handleDeletePracticeActivity(req, res, pathname);
  }
  
  // Practice Plans endpoints
  else if (req.method === 'GET' && pathname.match(/^\/api\/practice-plans\/team\/(.+)$/)) {
    handleGetPracticePlans(req, res, pathname);
  } else if (req.method === 'POST' && pathname === '/api/practice-plans') {
    handleCreatePracticePlan(req, res);
  } else if (req.method === 'GET' && pathname.match(/^\/api\/practice-plans\/(.+)$/)) {
    handleGetPracticePlan(req, res, pathname);
  } else if (req.method === 'PUT' && pathname.match(/^\/api\/practice-plans\/(.+)$/)) {
    handleUpdatePracticePlan(req, res, pathname);
  } else if (req.method === 'DELETE' && pathname.match(/^\/api\/practice-plans\/(.+)$/)) {
    handleDeletePracticePlan(req, res, pathname);
  }
  
  // Scheduled Practices endpoints
  else if (req.method === 'GET' && pathname.match(/^\/api\/scheduled-practices\/team\/(.+)$/)) {
    handleGetScheduledPractices(req, res, pathname);
  } else if (req.method === 'POST' && pathname === '/api/scheduled-practices') {
    handleCreateScheduledPractice(req, res);
  } else if (req.method === 'GET' && pathname.match(/^\/api\/scheduled-practices\/(.+)$/)) {
    handleGetScheduledPractice(req, res, pathname);
  } else if (req.method === 'PUT' && pathname.match(/^\/api\/scheduled-practices\/(.+)$/)) {
    handleUpdateScheduledPractice(req, res, pathname);
  } else if (req.method === 'DELETE' && pathname.match(/^\/api\/scheduled-practices\/(.+)$/)) {
    handleDeleteScheduledPractice(req, res, pathname);
  }
  
  // Events endpoints
  else if (req.method === 'GET' && pathname.match(/^\/api\/events\/team\/(.+)$/)) {
    handleGetEvents(req, res, pathname);
  } else if (req.method === 'POST' && pathname === '/api/events') {
    handleCreateEvent(req, res);
  } else if (req.method === 'GET' && pathname.match(/^\/api\/events\/(.+)$/)) {
    handleGetEvent(req, res, pathname);
  } else if (req.method === 'PUT' && pathname.match(/^\/api\/events\/(.+)$/)) {
    handleUpdateEvent(req, res, pathname);
  } else if (req.method === 'DELETE' && pathname.match(/^\/api\/events\/(.+)$/)) {
    handleDeleteEvent(req, res, pathname);
  }
  
  // Team Management endpoints
  else if (req.method === 'GET' && pathname.match(/^\/api\/users\/(.+)\/teams$/)) {
    handleGetUserTeams(req, res, pathname);
  } else if (req.method === 'POST' && pathname === '/api/teams') {
    handleCreateTeam(req, res);
  } else if (req.method === 'GET' && pathname.match(/^\/api\/teams\/(.+)$/)) {
    handleGetTeam(req, res, pathname);
  } else if (req.method === 'PUT' && pathname.match(/^\/api\/teams\/(.+)$/)) {
    handleUpdateTeam(req, res, pathname);
  } else if (req.method === 'DELETE' && pathname.match(/^\/api\/teams\/(.+)$/)) {
    handleDeleteTeam(req, res, pathname);
  }
  
  // Health check
  else if (req.method === 'GET' && pathname === '/health') {
    const response = { status: 'OK', timestamp: new Date().toISOString() };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Route not found' } }));
  }
});

// Auth handlers (same as before)
function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const { email } = JSON.parse(body);
      // Find user by email
      const user = users.find(u => u.email === email) || users[0]; // Default to first user
      
      const response = {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: user
        }
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleCurrentUser(req, res) {
  const response = {
    success: true,
    data: {
      user: users[0] // Return first user as default
    }
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));
}

// Player handlers (same as before)
function handleGetPlayers(req, res, pathname) {
  const teamId = pathname.split('/')[3];
  const teamPlayers = players.filter(p => p.team_id === teamId);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(teamPlayers));
}

function handleCreatePlayer(req, res, pathname) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const playerData = JSON.parse(body);
      const newPlayer = {
        id: nextPlayerId.toString(),
        ...playerData,
        created_at: new Date().toISOString()
      };
      players.push(newPlayer);
      nextPlayerId++;
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newPlayer));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleUpdatePlayer(req, res, pathname) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const playerId = pathname.split('/')[5];
      const playerData = JSON.parse(body);
      const playerIndex = players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message: 'Player not found' } }));
        return;
      }
      players[playerIndex] = { ...players[playerIndex], ...playerData };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(players[playerIndex]));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleDeletePlayer(req, res, pathname) {
  const playerId = pathname.split('/')[5];
  const playerIndex = players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Player not found' } }));
    return;
  }
  players.splice(playerIndex, 1);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Player deleted' }));
}

// Practice Activities handlers
function handleGetPracticeActivities(req, res, query) {
  let activities = [...practiceActivities];
  
  // Filter by search term
  if (query.search) {
    const search = query.search.toLowerCase();
    activities = activities.filter(activity => 
      activity.name.toLowerCase().includes(search) ||
      activity.description.toLowerCase().includes(search) ||
      activity.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }
  
  // Filter by category
  if (query.category) {
    activities = activities.filter(activity => activity.category === query.category);
  }
  
  // Filter by tags
  if (query.tags) {
    const tagArray = Array.isArray(query.tags) ? query.tags : [query.tags];
    activities = activities.filter(activity => 
      tagArray.some(tag => activity.tags.includes(tag))
    );
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(activities));
}

function handleCreatePracticeActivity(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const activityData = JSON.parse(body);
      const newActivity = {
        id: nextActivityId.toString(),
        ...activityData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      practiceActivities.push(newActivity);
      nextActivityId++;
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newActivity));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleGetPracticeActivity(req, res, pathname) {
  const activityId = pathname.split('/')[3];
  const activity = practiceActivities.find(a => a.id === activityId);
  if (!activity) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Activity not found' } }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(activity));
}

function handleUpdatePracticeActivity(req, res, pathname) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const activityId = pathname.split('/')[3];
      const activityData = JSON.parse(body);
      const activityIndex = practiceActivities.findIndex(a => a.id === activityId);
      if (activityIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message: 'Activity not found' } }));
        return;
      }
      practiceActivities[activityIndex] = { 
        ...practiceActivities[activityIndex], 
        ...activityData, 
        updated_at: new Date().toISOString() 
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(practiceActivities[activityIndex]));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleDeletePracticeActivity(req, res, pathname) {
  const activityId = pathname.split('/')[3];
  const activityIndex = practiceActivities.findIndex(a => a.id === activityId);
  if (activityIndex === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Activity not found' } }));
    return;
  }
  practiceActivities.splice(activityIndex, 1);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Activity deleted' }));
}

// Practice Plans handlers
function handleGetPracticePlans(req, res, pathname) {
  const teamId = pathname.split('/')[4];
  let plans = practicePlans.filter(p => p.team_id === teamId);
  
  // Populate activities for each plan
  plans = plans.map(plan => {
    const planActivityRelations = planActivities
      .filter(pa => pa.practice_plan_id === plan.id)
      .sort((a, b) => a.order_index - b.order_index);
    
    const activities = planActivityRelations.map(pa => {
      const activity = practiceActivities.find(a => a.id === pa.activity_id);
      return {
        ...activity,
        custom_duration: pa.custom_duration,
        custom_notes: pa.custom_notes,
        order_index: pa.order_index
      };
    });
    
    return { ...plan, activities };
  });
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(plans));
}

function handleCreatePracticePlan(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const planData = JSON.parse(body);
      const newPlan = {
        id: nextPlanId.toString(),
        name: planData.name,
        description: planData.description,
        team_id: planData.team_id,
        total_duration: planData.total_duration || 0,
        activity_ids: planData.activity_ids || [],
        is_template: planData.is_template || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      practicePlans.push(newPlan);
      
      // Create plan-activity relationships
      if (planData.activities) {
        planData.activities.forEach((activity, index) => {
          const planActivity = {
            id: nextPlanActivityId.toString(),
            practice_plan_id: newPlan.id,
            activity_id: activity.id,
            order_index: index,
            custom_duration: activity.custom_duration,
            custom_notes: activity.custom_notes
          };
          planActivities.push(planActivity);
          nextPlanActivityId++;
        });
      }
      
      nextPlanId++;
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newPlan));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleGetPracticePlan(req, res, pathname) {
  const planId = pathname.split('/')[3];
  const plan = practicePlans.find(p => p.id === planId);
  if (!plan) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Practice plan not found' } }));
    return;
  }
  
  // Populate activities
  const planActivityRelations = planActivities
    .filter(pa => pa.practice_plan_id === plan.id)
    .sort((a, b) => a.order_index - b.order_index);
  
  const activities = planActivityRelations.map(pa => {
    const activity = practiceActivities.find(a => a.id === pa.activity_id);
    return {
      ...activity,
      custom_duration: pa.custom_duration,
      custom_notes: pa.custom_notes,
      order_index: pa.order_index
    };
  });
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ...plan, activities }));
}

function handleUpdatePracticePlan(req, res, pathname) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const planId = pathname.split('/')[3];
      const planData = JSON.parse(body);
      const planIndex = practicePlans.findIndex(p => p.id === planId);
      if (planIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message: 'Practice plan not found' } }));
        return;
      }
      
      practicePlans[planIndex] = { 
        ...practicePlans[planIndex], 
        ...planData, 
        updated_at: new Date().toISOString() 
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(practicePlans[planIndex]));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleDeletePracticePlan(req, res, pathname) {
  const planId = pathname.split('/')[3];
  const planIndex = practicePlans.findIndex(p => p.id === planId);
  if (planIndex === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Practice plan not found' } }));
    return;
  }
  
  // Remove plan-activity relationships
  planActivities = planActivities.filter(pa => pa.practice_plan_id !== planId);
  
  practicePlans.splice(planIndex, 1);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Practice plan deleted' }));
}

// Scheduled Practices handlers
function handleGetScheduledPractices(req, res, pathname) {
  const teamId = pathname.split('/')[4];
  let practices = scheduledPractices.filter(p => p.team_id === teamId);
  
  // Populate practice plans
  practices = practices.map(practice => {
    if (practice.practice_plan_id) {
      const plan = practicePlans.find(p => p.id === practice.practice_plan_id);
      if (plan) {
        // Populate plan activities
        const planActivityRelations = planActivities
          .filter(pa => pa.practice_plan_id === plan.id)
          .sort((a, b) => a.order_index - b.order_index);
        
        const activities = planActivityRelations.map(pa => {
          const activity = practiceActivities.find(a => a.id === pa.activity_id);
          return {
            ...activity,
            custom_duration: pa.custom_duration,
            custom_notes: pa.custom_notes,
            order_index: pa.order_index
          };
        });
        
        return { ...practice, practice_plan: { ...plan, activities } };
      }
    }
    return practice;
  });
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(practices));
}

function handleCreateScheduledPractice(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const practiceData = JSON.parse(body);
      const newPractice = {
        id: nextScheduledPracticeId.toString(),
        ...practiceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      scheduledPractices.push(newPractice);
      nextScheduledPracticeId++;
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newPractice));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleGetScheduledPractice(req, res, pathname) {
  const practiceId = pathname.split('/')[3];
  const practice = scheduledPractices.find(p => p.id === practiceId);
  if (!practice) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Scheduled practice not found' } }));
    return;
  }
  
  // Populate practice plan if exists
  if (practice.practice_plan_id) {
    const plan = practicePlans.find(p => p.id === practice.practice_plan_id);
    if (plan) {
      const planActivityRelations = planActivities
        .filter(pa => pa.practice_plan_id === plan.id)
        .sort((a, b) => a.order_index - b.order_index);
      
      const activities = planActivityRelations.map(pa => {
        const activity = practiceActivities.find(a => a.id === pa.activity_id);
        return {
          ...activity,
          custom_duration: pa.custom_duration,
          custom_notes: pa.custom_notes,
          order_index: pa.order_index
        };
      });
      
      practice.practice_plan = { ...plan, activities };
    }
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(practice));
}

function handleUpdateScheduledPractice(req, res, pathname) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const practiceId = pathname.split('/')[3];
      const practiceData = JSON.parse(body);
      const practiceIndex = scheduledPractices.findIndex(p => p.id === practiceId);
      if (practiceIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message: 'Scheduled practice not found' } }));
        return;
      }
      
      scheduledPractices[practiceIndex] = { 
        ...scheduledPractices[practiceIndex], 
        ...practiceData, 
        updated_at: new Date().toISOString() 
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(scheduledPractices[practiceIndex]));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleDeleteScheduledPractice(req, res, pathname) {
  const practiceId = pathname.split('/')[3];
  const practiceIndex = scheduledPractices.findIndex(p => p.id === practiceId);
  if (practiceIndex === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Scheduled practice not found' } }));
    return;
  }
  
  scheduledPractices.splice(practiceIndex, 1);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Scheduled practice deleted' }));
}

// Event handlers
function handleGetEvents(req, res, pathname) {
  const teamId = pathname.split('/')[4];
  const teamEvents = events.filter(e => e.teamId === teamId);
  
  // Populate practice plans for practice events
  const eventsWithPlans = teamEvents.map(event => {
    if (event.type === 'practice' && event.practice_plan_id) {
      const plan = practicePlans.find(p => p.id === event.practice_plan_id);
      if (plan) {
        const planActivityRelations = planActivities
          .filter(pa => pa.practice_plan_id === plan.id)
          .sort((a, b) => a.order_index - b.order_index);
        
        const activities = planActivityRelations.map(pa => {
          const activity = practiceActivities.find(a => a.id === pa.activity_id);
          return {
            ...activity,
            custom_duration: pa.custom_duration,
            custom_notes: pa.custom_notes,
            order_index: pa.order_index
          };
        });
        
        return { ...event, practice_plan: { ...plan, activities } };
      }
    }
    return event;
  });
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(eventsWithPlans));
}

function handleCreateEvent(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const eventData = JSON.parse(body);
      const newEvent = {
        id: nextEventId.toString(),
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      events.push(newEvent);
      nextEventId++;
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newEvent));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleGetEvent(req, res, pathname) {
  const eventId = pathname.split('/')[3];
  const event = events.find(e => e.id === eventId);
  if (!event) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Event not found' } }));
    return;
  }
  
  // Populate practice plan if it's a practice event
  if (event.type === 'practice' && event.practice_plan_id) {
    const plan = practicePlans.find(p => p.id === event.practice_plan_id);
    if (plan) {
      const planActivityRelations = planActivities
        .filter(pa => pa.practice_plan_id === plan.id)
        .sort((a, b) => a.order_index - b.order_index);
      
      const activities = planActivityRelations.map(pa => {
        const activity = practiceActivities.find(a => a.id === pa.activity_id);
        return {
          ...activity,
          custom_duration: pa.custom_duration,
          custom_notes: pa.custom_notes,
          order_index: pa.order_index
        };
      });
      
      event.practice_plan = { ...plan, activities };
    }
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(event));
}

function handleUpdateEvent(req, res, pathname) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const eventId = pathname.split('/')[3];
      const eventData = JSON.parse(body);
      const eventIndex = events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message: 'Event not found' } }));
        return;
      }
      
      events[eventIndex] = { 
        ...events[eventIndex], 
        ...eventData, 
        updated_at: new Date().toISOString() 
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(events[eventIndex]));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleDeleteEvent(req, res, pathname) {
  const eventId = pathname.split('/')[3];
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Event not found' } }));
    return;
  }
  
  events.splice(eventIndex, 1);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Event deleted' }));
}

// Team handlers
function handleGetUserTeams(req, res, pathname) {
  const userId = pathname.split('/')[3];
  const userMemberships = userTeamMemberships.filter(m => m.user_id === userId);
  
  const userTeams = userMemberships.map(membership => {
    const team = teams.find(t => t.id === membership.team_id);
    return {
      ...team,
      user_role: membership.role,
      membership_id: membership.id
    };
  });
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(userTeams));
}

function handleCreateTeam(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const teamData = JSON.parse(body);
      const newTeam = {
        id: `team${nextTeamId}`,
        ...teamData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      teams.push(newTeam);
      
      // Create team owner membership
      const membership = {
        id: `membership${nextMembershipId}`,
        user_id: teamData.owner_id,
        team_id: newTeam.id,
        role: 'team_owner',
        player_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      userTeamMemberships.push(membership);
      
      nextTeamId++;
      nextMembershipId++;
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newTeam));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleGetTeam(req, res, pathname) {
  const teamId = pathname.split('/')[3];
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Team not found' } }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(team));
}

function handleUpdateTeam(req, res, pathname) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const teamId = pathname.split('/')[3];
      const teamData = JSON.parse(body);
      const teamIndex = teams.findIndex(t => t.id === teamId);
      if (teamIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { message: 'Team not found' } }));
        return;
      }
      
      teams[teamIndex] = { 
        ...teams[teamIndex], 
        ...teamData, 
        updated_at: new Date().toISOString() 
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(teams[teamIndex]));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message: 'Invalid JSON' } }));
    }
  });
}

function handleDeleteTeam(req, res, pathname) {
  const teamId = pathname.split('/')[3];
  const teamIndex = teams.findIndex(t => t.id === teamId);
  if (teamIndex === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Team not found' } }));
    return;
  }
  
  // Remove team and all related data
  teams.splice(teamIndex, 1);
  
  // Remove memberships
  const membershipIndicesToRemove = [];
  for (let i = userTeamMemberships.length - 1; i >= 0; i--) {
    if (userTeamMemberships[i].team_id === teamId) {
      membershipIndicesToRemove.push(i);
    }
  }
  membershipIndicesToRemove.forEach(index => {
    userTeamMemberships.splice(index, 1);
  });
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Team deleted' }));
}

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`✅ Structured Practice Management Mock Backend running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Roster endpoint: http://localhost:${PORT}/api/roster/team1/players`);
  console.log(`🏃 Practice Activities endpoint: http://localhost:${PORT}/api/practice-activities`);
  console.log(`📋 Practice Plans endpoint: http://localhost:${PORT}/api/practice-plans/team/team1`);
  console.log(`📅 Scheduled Practices endpoint: http://localhost:${PORT}/api/scheduled-practices/team/team1`);
  console.log(`🗓️ Events endpoint: http://localhost:${PORT}/api/events/team/team1`);
  console.log(`👥 Team endpoints: http://localhost:${PORT}/api/users/{userId}/teams`);
  console.log(`📊 Sample data loaded:`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${teams.length} teams`);
  console.log(`   - ${userTeamMemberships.length} team memberships`);
  console.log(`   - ${practiceActivities.length} practice activities`);
  console.log(`   - ${practicePlans.length} practice plans`);
  console.log(`   - ${scheduledPractices.length} scheduled practices`);
  console.log(`   - ${events.length} events`);
});
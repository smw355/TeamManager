const http = require('http');
const url = require('url');

// Mock data store
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

let practicePlans = [
  {
    id: '1',
    title: 'Basic Ball Control',
    description: 'Focus on dribbling, first touch, and ball control fundamentals',
    team_id: 'team1',
    duration: 90,
    date: '2025-06-25',
    activities: [
      {
        id: '1',
        name: 'Warm-up Jog',
        description: 'Light jogging around the field',
        duration: 10,
        category: 'warmup'
      },
      {
        id: '2',
        name: 'Ball Control Drills',
        description: 'Cone dribbling and first touch practice',
        duration: 25,
        category: 'technical'
      },
      {
        id: '3',
        name: 'Small-sided Games',
        description: '4v4 scrimmage focusing on ball control',
        duration: 30,
        category: 'tactical'
      },
      {
        id: '4',
        name: 'Cool Down',
        description: 'Stretching and light exercises',
        duration: 15,
        category: 'cooldown'
      }
    ],
    created_at: '2025-06-24T10:00:00Z',
    updated_at: '2025-06-24T10:00:00Z'
  },
  {
    id: '2',
    title: 'Passing & Movement',
    description: 'Develop passing accuracy and off-ball movement',
    team_id: 'team1',
    duration: 75,
    date: '2025-06-27',
    activities: [
      {
        id: '1',
        name: 'Dynamic Warm-up',
        description: 'Movement-based warm-up with the ball',
        duration: 15,
        category: 'warmup'
      },
      {
        id: '2',
        name: 'Passing Squares',
        description: 'Short and long passing in groups',
        duration: 20,
        category: 'technical'
      },
      {
        id: '3',
        name: 'Possession Game',
        description: '7v3 keep-away focusing on movement',
        duration: 25,
        category: 'tactical'
      },
      {
        id: '4',
        name: 'Shooting Practice',
        description: 'Finishing after combination play',
        duration: 15,
        category: 'technical'
      }
    ],
    created_at: '2025-06-24T11:00:00Z',
    updated_at: '2025-06-24T11:00:00Z'
  }
];

let nextPlayerId = 3;
let nextPracticePlanId = 3;
let nextActivityId = 5;

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

  // Auth endpoints
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    handleLogin(req, res);
  } else if (req.method === 'GET' && pathname === '/api/auth/me') {
    handleCurrentUser(req, res);
  }
  // Roster endpoints
  else if (req.method === 'GET' && pathname.match(/^\/api\/roster\/(.+)\/players$/)) {
    handleGetPlayers(req, res, pathname);
  } else if (req.method === 'POST' && pathname.match(/^\/api\/roster\/(.+)\/players$/)) {
    handleCreatePlayer(req, res, pathname);
  } else if (req.method === 'PUT' && pathname.match(/^\/api\/roster\/(.+)\/players\/(.+)$/)) {
    handleUpdatePlayer(req, res, pathname);
  } else if (req.method === 'DELETE' && pathname.match(/^\/api\/roster\/(.+)\/players\/(.+)$/)) {
    handleDeletePlayer(req, res, pathname);
  }
  // Practice Plan endpoints
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
      const response = {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: '1',
            email: email || 'demo@example.com',
            name: 'Demo User',
            role: 'coach',
            teams: ['team1']
          }
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
      user: {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'coach',
        teams: ['team1']
      }
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

// Practice Plan handlers
function handleGetPracticePlans(req, res, pathname) {
  const teamId = pathname.split('/')[4];
  const teamPlans = practicePlans.filter(p => p.team_id === teamId);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(teamPlans));
}

function handleCreatePracticePlan(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const planData = JSON.parse(body);
      const newPlan = {
        id: nextPracticePlanId.toString(),
        ...planData,
        activities: planData.activities || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      practicePlans.push(newPlan);
      nextPracticePlanId++;
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
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(plan));
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
  practicePlans.splice(planIndex, 1);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Practice plan deleted' }));
}

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`✅ Practice Plans Mock Backend running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Roster endpoint: http://localhost:${PORT}/api/roster/team1/players`);
  console.log(`📋 Practice Plans endpoint: http://localhost:${PORT}/api/practice-plans/team/team1`);
  console.log(`📋 Mock practice plans loaded: ${practicePlans.length}`);
});
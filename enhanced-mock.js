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

let nextPlayerId = 3;

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

function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
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

function handleGetPlayers(req, res, pathname) {
  const teamId = pathname.split('/')[3];
  const teamPlayers = players.filter(p => p.team_id === teamId);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(teamPlayers));
}

function handleCreatePlayer(req, res, pathname) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
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
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
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

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`✅ Enhanced mock backend running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Roster endpoint: http://localhost:${PORT}/api/roster/team1/players`);
  console.log(`📋 Mock players loaded: ${players.length}`);
});
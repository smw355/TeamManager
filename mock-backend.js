const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock user database
const users = [
  {
    id: '1',
    email: 'coach@demo.com',
    name: 'John Coach',
    role: 'coach',
    teams: ['team1']
  },
  {
    id: '2',
    email: 'parent@demo.com',
    name: 'Jane Parent',
    role: 'parent',
    teams: ['team1']
  }
];

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication - any email/password combo works
  const user = users.find(u => u.email === email) || {
    id: Date.now().toString(),
    email,
    name: email.split('@')[0],
    role: 'coach',
    teams: []
  };

  const token = 'mock-jwt-token-' + Date.now();
  
  res.json({
    success: true,
    data: {
      token,
      user
    }
  });
});

// Mock current user endpoint
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'No token provided' }
    });
  }

  // Return mock user
  res.json({
    success: true,
    data: {
      user: users[0] // Return coach user
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Mock backend running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
});
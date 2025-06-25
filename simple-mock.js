const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/login') {
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
              teams: []
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
  } else if (req.method === 'GET' && parsedUrl.pathname === '/health') {
    const response = { status: 'OK', timestamp: new Date().toISOString() };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { message: 'Route not found' } }));
  }
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`✅ Simple mock backend running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});
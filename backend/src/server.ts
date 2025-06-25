import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import rosterRoutes from './routes/roster';
import messageRoutes from './routes/messages';

// Database
import { runMigrations, seedData } from './database/migrate';
import { validateConnection, closePool } from './database/connection';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/roster', rosterRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_team', (teamId: string) => {
    socket.join(teamId);
    console.log(`User ${socket.id} joined team ${teamId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.teamId).emit('new_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.teamId).emit('user_typing', data);
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.teamId).emit('user_stop_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      status
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      status: 404
    }
  });
});

async function startServer() {
  try {
    console.log('🚀 Starting Tiko Express Server...');
    
    // Validate database connection first
    const dbConnected = await validateConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server: Database connection failed');
      process.exit(1);
    }
    
    // Run database migrations and seed data
    await runMigrations();
    await seedData();
    
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Frontend: http://localhost:3000`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await closePool();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

export default app;
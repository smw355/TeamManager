"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const roster_1 = __importDefault(require("./routes/roster"));
const messages_1 = __importDefault(require("./routes/messages"));
// Database
const migrate_1 = require("./database/migrate");
const connection_1 = require("./database/connection");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 8000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
// Middleware
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/roster', roster_1.default);
app.use('/api/messages', messages_1.default);
// Socket.IO for real-time messaging
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join_team', (teamId) => {
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
app.use((err, req, res, next) => {
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
        const dbConnected = await (0, connection_1.validateConnection)();
        if (!dbConnected) {
            console.error('❌ Cannot start server: Database connection failed');
            process.exit(1);
        }
        // Run database migrations and seed data
        await (0, migrate_1.runMigrations)();
        await (0, migrate_1.seedData)();
        server.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`📖 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 Frontend: http://localhost:3000`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await (0, connection_1.closePool)();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await (0, connection_1.closePool)();
    process.exit(0);
});
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=server.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.getClient = exports.query = exports.validateConnection = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Connection validation
const validateConnection = async () => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};
exports.validateConnection = validateConnection;
// Enhanced query function with better error handling
const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    }
    catch (error) {
        console.error('Database query error:', {
            query: text,
            params,
            error: error instanceof Error ? error.message : error
        });
        throw error;
    }
};
exports.query = query;
const getClient = () => pool.connect();
exports.getClient = getClient;
// Graceful shutdown
const closePool = async () => {
    try {
        await pool.end();
        console.log('📦 Database pool closed');
    }
    catch (error) {
        console.error('Error closing database pool:', error);
    }
};
exports.closePool = closePool;
exports.default = pool;
//# sourceMappingURL=connection.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.getMessages = void 0;
const connection_1 = require("../database/connection");
const getMessages = async (req, res) => {
    try {
        const { teamId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const result = await (0, connection_1.query)(`SELECT m.*, u.name as user_name, u.role as user_role 
       FROM messages m 
       JOIN users u ON m.user_id = u.id 
       WHERE m.team_id = $1 
       ORDER BY m.created_at DESC 
       LIMIT $2 OFFSET $3`, [teamId, limit, offset]);
        res.json(result.rows.reverse()); // Reverse to show oldest first
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMessages = getMessages;
const createMessage = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { content, type = 'text' } = req.body;
        const userId = req.user.id;
        const result = await (0, connection_1.query)('INSERT INTO messages (team_id, user_id, content, type) VALUES ($1, $2, $3, $4) RETURNING *', [teamId, userId, content, type]);
        // Get user info for the response
        const userResult = await (0, connection_1.query)('SELECT name, role FROM users WHERE id = $1', [userId]);
        const message = {
            ...result.rows[0],
            user_name: userResult.rows[0].name,
            user_role: userResult.rows[0].role
        };
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createMessage = createMessage;
//# sourceMappingURL=messageController.js.map
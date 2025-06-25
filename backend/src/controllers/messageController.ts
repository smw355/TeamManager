import { Request, Response } from 'express';
import { query } from '../database/connection';

interface AuthRequest extends Request {
  user?: any;
}

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT m.*, u.name as user_name, u.role as user_role 
       FROM messages m 
       JOIN users u ON m.user_id = u.id 
       WHERE m.team_id = $1 
       ORDER BY m.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [teamId, limit, offset]
    );

    res.json(result.rows.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { content, type = 'text' } = req.body;
    const userId = req.user.id;

    const result = await query(
      'INSERT INTO messages (team_id, user_id, content, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [teamId, userId, content, type]
    );

    // Get user info for the response
    const userResult = await query('SELECT name, role FROM users WHERE id = $1', [userId]);
    
    const message = {
      ...result.rows[0],
      user_name: userResult.rows[0].name,
      user_role: userResult.rows[0].role
    };

    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
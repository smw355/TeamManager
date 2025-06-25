import { Request, Response } from 'express';
import { query } from '../database/connection';

interface AuthRequest extends Request {
  user?: any;
}

export const getPlayers = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    
    const result = await query(
      'SELECT * FROM players WHERE team_id = $1 ORDER BY number',
      [teamId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, number, position, age, stats } = req.body;

    const result = await query(
      'INSERT INTO players (team_id, name, number, position, age, stats) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [teamId, name, number, position, age, JSON.stringify(stats || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Player number already exists for this team' });
    } else {
      console.error('Create player error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;
    const { name, number, position, age, stats } = req.body;

    const result = await query(
      'UPDATE players SET name = $1, number = $2, position = $3, age = $4, stats = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND team_id = $7 RETURNING *',
      [name, number, position, age, JSON.stringify(stats), playerId, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, playerId } = req.params;

    const result = await query(
      'DELETE FROM players WHERE id = $1 AND team_id = $2 RETURNING id',
      [playerId, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';
import { ApiResponse } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'User already exists',
          code: 'USER_EXISTS',
          status: 400
        }
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, passwordHash, name, role]
    );

    const user = result.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        status: 500
      }
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        team_id: user.team_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const demoLogin = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    // Find demo user by role
    const result = await query('SELECT * FROM users WHERE role = $1 LIMIT 1', [role]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    const user = result.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        team_id: user.team_id
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    const result = await query('SELECT id, email, name, role, team_id FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
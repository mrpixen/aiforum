import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from 'class-validator';
import { AppError } from '../middleware/errorHandler';

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: [{ username }, { email }]
      });

      if (existingUser) {
        throw new AppError('Username or email already exists', 400);
      }

      // Create new user
      const user = new User();
      user.username = username;
      user.email = email;
      user.password = await bcrypt.hash(password, 10);
      user.role = 'user';

      // Validate user
      const errors = await validate(user);
      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        throw new AppError(errors.map(e => Object.values(e.constraints || {})).flat().join(', '), 400);
      }

      // Save user
      await userRepository.save(user);

      // Generate token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'An error occurred during registration'
        });
      }
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Login error:', error);
        res.status(500).json({
          message: 'An error occurred during login'
        });
      }
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Token is required', 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        throw new AppError('Invalid token', 401);
      }

      const newToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid token' });
      } else if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' });
      } else {
        console.error('Refresh token error:', error);
        res.status(500).json({
          message: 'An error occurred while refreshing token'
        });
      }
    }
  }
} 
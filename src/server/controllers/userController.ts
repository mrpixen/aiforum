import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { validate } from 'class-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import { MoreThan } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);

export class UserController {
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

      // Validate user
      const errors = await validate(user);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      await userRepository.save(user);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error registering user' });
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

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error logging in' });
      }
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json(user);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error fetching profile' });
      }
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { username, email } = req.body;

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.username = username || user.username;
      user.email = email || user.email;

      const errors = await validate(user);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      await userRepository.save(user);
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error updating profile' });
      }
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await userRepository.save(user);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error changing password' });
      }
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await userRepository.findOne({ where: { id: req.params.id } });
      if (!user) {
        throw new AppError('User not found', 404);
      }
      res.json(user);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error fetching user' });
      }
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { username, email, role } = req.body;
      const user = await userRepository.findOne({ where: { id: req.params.id } });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.username = username || user.username;
      user.email = email || user.email;
      user.role = role || user.role;

      const errors = await validate(user);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      await userRepository.save(user);
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error updating user' });
      }
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user = await userRepository.findOne({ where: { id: req.params.id } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await userRepository.remove(user);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error deleting user' });
      }
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const user = await userRepository.findOne({ where: { emailVerificationToken: token } });

      if (!user) {
        throw new AppError('Invalid verification token', 400);
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await userRepository.save(user);

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error verifying email' });
      }
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
      await userRepository.save(user);

      // TODO: Send email with reset link
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error processing forgot password request' });
      }
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await userRepository.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: MoreThan(new Date())
        }
      });

      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      user.password = await bcrypt.hash(password, 10);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await userRepository.save(user);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error resetting password' });
      }
    }
  }
} 
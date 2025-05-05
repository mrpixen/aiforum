import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../models/Notification';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Thread } from '../models/Thread';
import { AppError } from '../middleware/errorHandler';
import { validate } from 'class-validator';

const notificationRepository = AppDataSource.getRepository(Notification);
const userRepository = AppDataSource.getRepository(User);
const postRepository = AppDataSource.getRepository(Post);
const threadRepository = AppDataSource.getRepository(Thread);

export class NotificationController {
  static async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const queryBuilder = notificationRepository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.sender', 'sender')
        .leftJoinAndSelect('notification.post', 'post')
        .leftJoinAndSelect('notification.thread', 'thread')
        .where('notification.recipientId = :userId', { userId })
        .orderBy('notification.createdAt', 'DESC');

      if (unreadOnly === 'true') {
        queryBuilder.andWhere('notification.isRead = false');
      }

      const [notifications, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      res.json({
        notifications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
          message: 'An error occurred while fetching notifications'
        });
      }
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const notification = await notificationRepository.findOne({
        where: { id, recipient: { id: userId } }
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      notification.isRead = true;
      await notificationRepository.save(notification);

      res.json({
        message: 'Notification marked as read'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
          message: 'An error occurred while marking the notification as read'
        });
      }
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true })
        .where('recipientId = :userId', { userId })
        .andWhere('isRead = false')
        .execute();

      res.json({
        message: 'All notifications marked as read'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({
          message: 'An error occurred while marking notifications as read'
        });
      }
    }
  }

  static async createNotification(
    type: NotificationType,
    recipientId: string,
    message: string,
    senderId?: string,
    postId?: string,
    threadId?: string
  ) {
    try {
      const notification = new Notification();
      notification.type = type;
      notification.message = message;
      notification.isRead = false;

      // Set recipient
      const recipient = await userRepository.findOne({ where: { id: recipientId } });
      if (!recipient) {
        throw new Error('Recipient not found');
      }
      notification.recipient = recipient;

      // Set sender if provided
      if (senderId) {
        const sender = await userRepository.findOne({ where: { id: senderId } });
        if (sender) {
          notification.sender = sender;
        }
      }

      // Set post if provided
      if (postId) {
        const post = await postRepository.findOne({ where: { id: postId } });
        if (post) {
          notification.post = post;
        }
      }

      // Set thread if provided
      if (threadId) {
        const thread = await threadRepository.findOne({ where: { id: threadId } });
        if (thread) {
          notification.thread = thread;
        }
      }

      // Validate notification
      const errors = await validate(notification);
      if (errors.length > 0) {
        throw new Error('Validation failed');
      }

      // Save notification
      await notificationRepository.save(notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
} 
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { Thread } from '../models/Thread';
import { AppError } from '../middleware/errorHandler';
import { validate } from 'class-validator';
import { NotificationController } from './notificationsController';
import { NotificationType } from '../models/Notification';

const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);
const threadRepository = AppDataSource.getRepository(Thread);

export class PostController {
  static async getAllPosts(req: Request, res: Response) {
    try {
      const { threadId, userId, parentId, page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const queryBuilder = postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.thread', 'thread')
        .leftJoinAndSelect('post.parent', 'parent')
        .leftJoinAndSelect('post.replies', 'replies')
        .leftJoinAndSelect('post.reactions', 'reactions')
        .orderBy('post.createdAt', 'ASC');

      if (threadId) {
        queryBuilder.andWhere('post.threadId = :threadId', { threadId });
      }

      if (userId) {
        queryBuilder.andWhere('post.userId = :userId', { userId });
      }

      if (parentId) {
        queryBuilder.andWhere('post.parentId = :parentId', { parentId });
      } else {
        queryBuilder.andWhere('post.parentId IS NULL');
      }

      const [posts, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      res.json({
        posts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        message: 'An error occurred while fetching posts'
      });
    }
  }

  static async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await postRepository.findOne({
        where: { id },
        relations: ['user', 'thread', 'parent', 'replies', 'reactions']
      });

      if (!post) {
        throw new AppError('Post not found', 404);
      }

      res.json(post);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error fetching post:', error);
        res.status(500).json({
          message: 'An error occurred while fetching the post'
        });
      }
    }
  }

  static async createPost(req: Request, res: Response) {
    try {
      const { content, threadId, parentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Find user
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Find thread
      const thread = await threadRepository.findOne({ where: { id: threadId } });
      if (!thread) {
        throw new AppError('Thread not found', 404);
      }

      // Check if thread is locked
      if (thread.isLocked) {
        throw new AppError('Cannot post in a locked thread', 403);
      }

      // Create post
      const post = new Post();
      post.content = content;
      post.user = user;
      post.thread = thread;

      // Set parent if provided
      if (parentId) {
        const parent = await postRepository.findOne({
          where: { id: parentId },
          relations: ['user']
        });
        if (!parent) {
          throw new AppError('Parent post not found', 404);
        }
        post.parent = parent;

        // Create notification for reply
        if (parent.user.id !== userId) {
          await NotificationController.createNotification(
            NotificationType.NEW_REPLY,
            parent.user.id,
            `${user.username} replied to your post`,
            userId,
            parent.id,
            threadId
          );
        }
      }

      // Validate post
      const errors = await validate(post);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      // Save post
      await postRepository.save(post);

      res.status(201).json({
        message: 'Post created successfully',
        post
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error creating post:', error);
        res.status(500).json({
          message: 'An error occurred while creating the post'
        });
      }
    }
  }

  static async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      // Find post
      const post = await postRepository.findOne({
        where: { id },
        relations: ['user', 'thread']
      });

      if (!post) {
        throw new AppError('Post not found', 404);
      }

      // Check if user is author or admin
      if (post.user.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Not authorized to update this post', 403);
      }

      // Check if thread is locked
      if (post.thread.isLocked) {
        throw new AppError('Cannot update post in a locked thread', 403);
      }

      // Update post
      post.content = content || post.content;

      // Validate post
      const errors = await validate(post);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      // Save post
      await postRepository.save(post);

      res.json({
        message: 'Post updated successfully',
        post
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error updating post:', error);
        res.status(500).json({
          message: 'An error occurred while updating the post'
        });
      }
    }
  }

  static async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Find post
      const post = await postRepository.findOne({
        where: { id },
        relations: ['user', 'thread']
      });

      if (!post) {
        throw new AppError('Post not found', 404);
      }

      // Check if user is author or admin
      if (post.user.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Not authorized to delete this post', 403);
      }

      // Check if thread is locked
      if (post.thread.isLocked) {
        throw new AppError('Cannot delete post in a locked thread', 403);
      }

      // Delete post
      await postRepository.remove(post);

      res.json({
        message: 'Post deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error deleting post:', error);
        res.status(500).json({
          message: 'An error occurred while deleting the post'
        });
      }
    }
  }
} 
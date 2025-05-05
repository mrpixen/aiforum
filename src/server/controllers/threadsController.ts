import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Thread } from '../models/Thread';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Tag } from '../models/Tag';
import { AppError } from '../middleware/errorHandler';
import { validate } from 'class-validator';

const threadRepository = AppDataSource.getRepository(Thread);
const userRepository = AppDataSource.getRepository(User);
const categoryRepository = AppDataSource.getRepository(Category);
const tagRepository = AppDataSource.getRepository(Tag);

export class ThreadController {
  static async getAllThreads(req: Request, res: Response) {
    try {
      const { categoryId, tagId, authorId, search, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const queryBuilder = threadRepository
        .createQueryBuilder('thread')
        .leftJoinAndSelect('thread.user', 'user')
        .leftJoinAndSelect('thread.category', 'category')
        .leftJoinAndSelect('thread.tags', 'tags')
        .leftJoinAndSelect('thread.posts', 'posts')
        .orderBy('thread.isPinned', 'DESC')
        .addOrderBy('thread.createdAt', 'DESC');

      if (categoryId) {
        queryBuilder.andWhere('thread.categoryId = :categoryId', { categoryId });
      }

      if (tagId) {
        queryBuilder.andWhere('tags.id = :tagId', { tagId });
      }

      if (authorId) {
        queryBuilder.andWhere('thread.userId = :authorId', { authorId });
      }

      if (search) {
        queryBuilder.andWhere('(thread.title LIKE :search OR thread.content LIKE :search)', {
          search: `%${search}%`
        });
      }

      const [threads, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      res.json({
        threads,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching threads:', error);
      res.status(500).json({
        message: 'An error occurred while fetching threads'
      });
    }
  }

  static async getThreadById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const thread = await threadRepository.findOne({
        where: { id },
        relations: ['user', 'category', 'tags', 'posts']
      });

      if (!thread) {
        throw new AppError('Thread not found', 404);
      }

      // Increment view count
      thread.viewCount += 1;
      await threadRepository.save(thread);

      res.json(thread);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error fetching thread:', error);
        res.status(500).json({
          message: 'An error occurred while fetching the thread'
        });
      }
    }
  }

  static async createThread(req: Request, res: Response) {
    try {
      const { title, content, categoryId, tagIds } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Find user
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Find category
      const category = await categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Create thread
      const thread = new Thread();
      thread.title = title;
      thread.content = content;
      thread.user = user;
      thread.category = category;

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        const tags = await tagRepository.findByIds(tagIds);
        thread.tags = tags;
      }

      // Validate thread
      const errors = await validate(thread);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      // Save thread
      await threadRepository.save(thread);

      res.status(201).json({
        message: 'Thread created successfully',
        thread
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error creating thread:', error);
        res.status(500).json({
          message: 'An error occurred while creating the thread'
        });
      }
    }
  }

  static async updateThread(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, content, categoryId, tagIds, isLocked, isPinned } = req.body;
      const userId = req.user?.id;

      // Find thread
      const thread = await threadRepository.findOne({
        where: { id },
        relations: ['user', 'category', 'tags']
      });

      if (!thread) {
        throw new AppError('Thread not found', 404);
      }

      // Check if user is owner or admin
      if (thread.user.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Not authorized to update this thread', 403);
      }

      // Update thread
      thread.title = title || thread.title;
      thread.content = content || thread.content;
      thread.isLocked = isLocked ?? thread.isLocked;
      thread.isPinned = isPinned ?? thread.isPinned;

      // Update category if provided
      if (categoryId) {
        const category = await categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
          throw new AppError('Category not found', 404);
        }
        thread.category = category;
      }

      // Update tags if provided
      if (tagIds) {
        const tags = await tagRepository.findByIds(tagIds);
        thread.tags = tags;
      }

      // Validate thread
      const errors = await validate(thread);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      // Save thread
      await threadRepository.save(thread);

      res.json({
        message: 'Thread updated successfully',
        thread
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error updating thread:', error);
        res.status(500).json({
          message: 'An error occurred while updating the thread'
        });
      }
    }
  }

  static async deleteThread(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Find thread
      const thread = await threadRepository.findOne({
        where: { id },
        relations: ['user', 'posts']
      });

      if (!thread) {
        throw new AppError('Thread not found', 404);
      }

      // Check if user is owner or admin
      if (thread.user.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Not authorized to delete this thread', 403);
      }

      // Check if thread has posts
      if (thread.posts && thread.posts.length > 0) {
        throw new AppError('Cannot delete thread with existing posts', 400);
      }

      // Delete thread
      await threadRepository.remove(thread);

      res.json({
        message: 'Thread deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error deleting thread:', error);
        res.status(500).json({
          message: 'An error occurred while deleting the thread'
        });
      }
    }
  }

  static async lockThread(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const thread = await threadRepository.findOne({ where: { id }, relations: ['user'] });
      if (!thread) {
        throw new AppError('Thread not found', 404);
      }
      if (!req.user || req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
      }
      thread.isLocked = !thread.isLocked;  // Toggle lock status
      await threadRepository.save(thread);
      res.json({ message: 'Thread locked status updated', thread });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error locking thread:', error);
        res.status(500).json({ message: 'An error occurred' });
      }
    }
  }

  static async pinThread(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const thread = await threadRepository.findOne({ where: { id }, relations: ['user'] });
      if (!thread) {
        throw new AppError('Thread not found', 404);
      }
      if (!req.user || req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
      }
      thread.isPinned = !thread.isPinned;  // Toggle pinned status
      await threadRepository.save(thread);
      res.json({ message: 'Thread pinned status updated', thread });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error pinning thread:', error);
        res.status(500).json({ message: 'An error occurred' });
      }
    }
  }
} 
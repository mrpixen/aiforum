import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Reaction } from '../models/Reaction';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { validate } from 'class-validator';
import { NotificationController } from './notificationsController';
import { NotificationType } from '../models/Notification';

const reactionRepository = AppDataSource.getRepository(Reaction);
const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);

export class ReactionController {
  static async getPostReactions(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { type } = req.query;

      const queryBuilder = reactionRepository
        .createQueryBuilder('reaction')
        .leftJoinAndSelect('reaction.user', 'user')
        .where('reaction.postId = :postId', { postId });

      if (type) {
        queryBuilder.andWhere('reaction.type = :type', { type });
      }

      const reactions = await queryBuilder.getMany();

      res.json(reactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
      res.status(500).json({
        message: 'An error occurred while fetching reactions'
      });
    }
  }

  static async addReaction(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { type } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Find post
      const post = await postRepository.findOne({
        where: { id: postId },
        relations: ['user', 'thread']
      });
      if (!post) {
        throw new AppError('Post not found', 404);
      }

      // Find user
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user already reacted
      const existingReaction = await reactionRepository.findOne({
        where: {
          post: { id: postId },
          user: { id: userId }
        }
      });

      if (existingReaction) {
        throw new AppError('User already reacted to this post', 400);
      }

      // Create reaction
      const reaction = new Reaction();
      reaction.type = type;
      reaction.post = post;
      reaction.user = user;

      // Validate reaction
      const errors = await validate(reaction);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      // Save reaction
      await reactionRepository.save(reaction);

      // Update post reaction count
      post.reactionCount = (post.reactionCount || 0) + 1;
      await postRepository.save(post);

      // Create notification if the post user is not the reactor
      if (post.user.id !== userId) {
        await NotificationController.createNotification(
          NotificationType.REACTION,
          post.user.id,
          `${user.username} reacted to your post with ${type}`,
          userId,
          postId,
          post.thread.id
        );
      }

      res.status(201).json({
        message: 'Reaction added successfully',
        reaction
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error adding reaction:', error);
        res.status(500).json({
          message: 'An error occurred while adding the reaction'
        });
      }
    }
  }

  static async removeReaction(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const reaction = await reactionRepository.findOne({
        where: {
          post: { id: postId },
          user: { id: userId }
        },
        relations: ['post']
      });

      if (!reaction) {
        throw new AppError('Reaction not found', 404);
      }

      await reactionRepository.remove(reaction);

      const post = reaction.post;
      post.reactionCount = Math.max(0, (post.reactionCount || 0) - 1);
      await postRepository.save(post);

      res.json({
        message: 'Reaction removed successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error removing reaction:', error);
        res.status(500).json({
          message: 'An error occurred while removing the reaction'
        });
      }
    }
  }

  static async createReaction(req: Request, res: Response) {
    try {
      const { postId, type } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const post = await postRepository.findOne({ where: { id: postId } });
      if (!post) {
        throw new AppError('Post not found', 404);
      }

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const reaction = new Reaction();
      reaction.post = post;
      reaction.user = user;
      reaction.type = type;

      await reactionRepository.save(reaction);

      res.status(201).json({ message: 'Reaction created successfully', reaction });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error creating reaction:', error);
        res.status(500).json({ message: 'An error occurred' });
      }
    }
  }
}
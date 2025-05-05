import { Router } from 'express';
import { PostController } from '../controllers/postsController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', PostController.getAllPosts);
router.get('/:id', PostController.getPostById);

// Protected routes
router.post('/', authenticate, PostController.createPost);
router.put('/:id', authenticate, PostController.updatePost);
router.delete('/:id', authenticate, PostController.deletePost);

// Admin routes
router.delete('/admin/:id', authenticate, isAdmin, PostController.deletePost);

export default router; 
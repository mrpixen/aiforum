import { Router } from 'express';
import { ReactionController } from '../controllers/reactionsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/posts/:postId', ReactionController.getPostReactions);

// Protected routes
router.post('/posts/:postId', authenticate, ReactionController.addReaction);
router.delete('/posts/:postId', authenticate, ReactionController.removeReaction);

router.post('/', authenticate, ReactionController.createReaction);

export default router; 
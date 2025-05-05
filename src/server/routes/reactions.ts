import { Router } from 'express';
import { ReactionController } from '../controllers/reactionsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/posts/:postId', ReactionController.getPostReactions);

// Protected routes
router.post('/posts/:postId', authenticate, ReactionController.addReaction);
router.delete('/posts/:postId', authenticate, ReactionController.removeReaction);

router.post('/', (req, res) => {
  res.json({ message: 'Create reaction' });
});

export default router; 
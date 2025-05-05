import { Router } from 'express';
import { ThreadController } from '../controllers/threadsController';
import { authenticate, isAdmin, isModerator } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all threads' });
});

router.get('/:id', (req, res) => ThreadController.getThreadById(req, res));

// Protected routes (authenticated users)
router.post('/', authenticate, (req, res) => ThreadController.createThread(req, res));
router.put('/:id', authenticate, (req, res) => ThreadController.updateThread(req, res));
router.delete('/:id', authenticate, (req, res) => ThreadController.deleteThread(req, res));

// Admin/Moderator routes
router.put('/:id/lock', authenticate, isModerator, (req, res) => ThreadController.updateThread(req, res));
router.put('/:id/pin', authenticate, isModerator, (req, res) => ThreadController.updateThread(req, res));

export default router; 
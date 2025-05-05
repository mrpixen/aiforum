import { Router } from 'express';
import { ThreadController } from '../controllers/threadsController';
import { authenticate, isAdmin, isModerator } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', ThreadController.getAllThreads);
router.get('/:id', ThreadController.getThreadById);

// Protected routes (authenticated users)
router.post('/', authenticate, ThreadController.createThread);
router.put('/:id', authenticate, ThreadController.updateThread);
router.delete('/:id', authenticate, ThreadController.deleteThread);

// Admin/Moderator routes
router.put('/:id/lock', authenticate, isModerator, ThreadController.lockThread);
router.put('/:id/pin', authenticate, isModerator, ThreadController.pinThread);

export default router; 
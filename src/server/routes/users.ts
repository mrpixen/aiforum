import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { UserController } from '../controllers/userController';

const router = Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/verify-email/:token', UserController.verifyEmail);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password/:token', UserController.resetPassword);

// Protected routes
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.put('/change-password', authenticate, UserController.changePassword);

// Admin routes
router.get('/', authenticate, isAdmin, UserController.getAllUsers);
router.get('/:id', authenticate, isAdmin, UserController.getUserById);
router.put('/:id', authenticate, isAdmin, UserController.updateUser);
router.delete('/:id', authenticate, isAdmin, UserController.deleteUser);

export default router; 
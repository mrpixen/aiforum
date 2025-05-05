import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserController } from '../controllers/userController';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.get('/verify-email/:token', UserController.verifyEmail);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password/:token', UserController.resetPassword);

export default router; 
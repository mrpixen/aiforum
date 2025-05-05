import { Router } from 'express';
import { NotificationController } from '../controllers/notificationsController';
import { authenticate } from '../middleware/auth';

const notificationRouter: Router = Router();

notificationRouter.get('/', authenticate, NotificationController.getUserNotifications);
notificationRouter.patch('/:id/read', authenticate, NotificationController.markAsRead);
notificationRouter.patch('/read-all', authenticate, NotificationController.markAllAsRead);

export = notificationRouter; 
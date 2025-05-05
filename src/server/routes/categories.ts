import { Router } from 'express';
import { CategoryController } from '../controllers/categoriesController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Protected routes (admin only)
router.post('/', authenticate, isAdmin, CategoryController.createCategory);
router.put('/:id', authenticate, isAdmin, CategoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, CategoryController.deleteCategory);

export default router; 
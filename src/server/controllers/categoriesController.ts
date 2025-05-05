import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Category } from '../models/Category';
import { AppError } from '../middleware/errorHandler';
import { validate } from 'class-validator';

const categoryRepository = AppDataSource.getRepository(Category);

export class CategoryController {
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await categoryRepository.find({
        relations: ['threads', 'parent', 'children'],
        order: {
          order: 'ASC',
          name: 'ASC'
        }
      });

      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        message: 'An error occurred while fetching categories'
      });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await categoryRepository.findOne({
        where: { id },
        relations: ['threads', 'parent', 'children']
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      res.json(category);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error fetching category:', error);
        res.status(500).json({
          message: 'An error occurred while fetching the category'
        });
      }
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, description, order, parentId } = req.body;

      // Check if category already exists
      const existingCategory = await categoryRepository.findOne({
        where: { name }
      });

      if (existingCategory) {
        throw new AppError('Category with this name already exists', 400);
      }

      // Create new category
      const category = new Category();
      category.name = name;
      category.description = description;
      category.order = order || 0;
      category.isActive = true;

      // Set parent if provided
      if (parentId) {
        const parent = await categoryRepository.findOne({
          where: { id: parentId }
        });
        if (!parent) {
          throw new AppError('Parent category not found', 404);
        }
        category.parent = parent;
      }

      // Validate category
      const errors = await validate(category);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      // Save category
      await categoryRepository.save(category);

      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error creating category:', error);
        res.status(500).json({
          message: 'An error occurred while creating the category'
        });
      }
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, order, isActive, parentId } = req.body;

      // Find category
      const category = await categoryRepository.findOne({
        where: { id },
        relations: ['parent', 'children']
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if new name conflicts with existing category
      if (name && name !== category.name) {
        const existingCategory = await categoryRepository.findOne({
          where: { name }
        });

        if (existingCategory) {
          throw new AppError('Category with this name already exists', 400);
        }
      }

      // Update category
      category.name = name || category.name;
      category.description = description ?? category.description;
      category.order = order ?? category.order;
      category.isActive = isActive ?? category.isActive;

      // Update parent if provided
      if (parentId !== undefined) {
        if (parentId === null) {
          category.parent = null;
        } else {
          const parent = await categoryRepository.findOne({
            where: { id: parentId }
          });
          if (!parent) {
            throw new AppError('Parent category not found', 404);
          }
          category.parent = parent;
        }
      }

      // Validate category
      const errors = await validate(category);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400);
      }

      // Save category
      await categoryRepository.save(category);

      res.json({
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error updating category:', error);
        res.status(500).json({
          message: 'An error occurred while updating the category'
        });
      }
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Find category
      const category = await categoryRepository.findOne({
        where: { id },
        relations: ['threads', 'children']
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if category has threads
      if (category.threads && category.threads.length > 0) {
        throw new AppError('Cannot delete category with existing threads', 400);
      }

      // Check if category has children
      if (category.children && category.children.length > 0) {
        throw new AppError('Cannot delete category with existing subcategories', 400);
      }

      // Delete category
      await categoryRepository.remove(category);

      res.json({
        message: 'Category deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error deleting category:', error);
        res.status(500).json({
          message: 'An error occurred while deleting the category'
        });
      }
    }
  }
} 
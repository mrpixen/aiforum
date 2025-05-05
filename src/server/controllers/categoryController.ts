import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Category } from '../models/Category';
import { validate } from 'class-validator';

const categoryRepository = AppDataSource.getRepository(Category);

export class CategoryController {
  static async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryRepository.find({
        relations: ['parent', 'children'],
        order: {
          order: 'ASC'
        }
      });
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const category = await categoryRepository.findOne({
        where: { id: req.params.id },
        relations: ['parent', 'children', 'threads']
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Error fetching category' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, description, order, parentId } = req.body;

      const category = new Category();
      category.name = name;
      category.description = description;
      category.order = order || 0;

      if (parentId) {
        const parent = await categoryRepository.findOne({ where: { id: parentId } });
        if (!parent) {
          return res.status(404).json({ message: 'Parent category not found' });
        }
        category.parent = parent;
      }

      const errors = await validate(category);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      await categoryRepository.save(category);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Error creating category' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { name, description, order, parentId } = req.body;

      const category = await categoryRepository.findOne({
        where: { id: req.params.id },
        relations: ['parent']
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      category.name = name || category.name;
      category.description = description || category.description;
      category.order = order || category.order;

      if (parentId) {
        const parent = await categoryRepository.findOne({ where: { id: parentId } });
        if (!parent) {
          return res.status(404).json({ message: 'Parent category not found' });
        }
        category.parent = parent;
      }

      const errors = await validate(category);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      await categoryRepository.save(category);
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Error updating category' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const category = await categoryRepository.findOne({
        where: { id: req.params.id },
        relations: ['children']
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      if (category.children && category.children.length > 0) {
        return res.status(400).json({ message: 'Cannot delete category with subcategories' });
      }

      await categoryRepository.remove(category);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Error deleting category' });
    }
  }
} 
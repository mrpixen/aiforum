import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Thread } from '../models/Thread';
import { Post } from '../models/Post';
import { Tag } from '../models/Tag';
import { Reaction } from '../models/Reaction';
import { Notification } from '../models/Notification';
import 'dotenv/config';

const createDefaultCategories = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);
  const count = await categoryRepository.count();
  
  if (count === 0) {
    const defaultCategories = [
      {
        name: 'General Discussion',
        description: 'General topics and discussions',
        order: 1
      },
      {
        name: 'Announcements',
        description: 'Important announcements and updates',
        order: 2
      },
      {
        name: 'Help & Support',
        description: 'Get help and support from the community',
        order: 3
      },
      {
        name: 'Feedback & Suggestions',
        description: 'Share your feedback and suggestions',
        order: 4
      }
    ];

    for (const categoryData of defaultCategories) {
      const category = new Category();
      Object.assign(category, categoryData);
      await categoryRepository.save(category);
    }
    
    console.log('Default categories created');
  }
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Somethinglmao',
  database: 'forum',
  schema: 'public',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Category, Thread, Post, Tag, Reaction, Notification],
  migrations: ['src/server/migrations/*.ts'],
  subscribers: ['src/server/subscribers/*.ts'],
  dropSchema: true, // This will drop all tables and recreate them
  migrationsRun: false // Don't run migrations automatically
});

// Initialize the database and create default categories
AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection established');
    await createDefaultCategories(AppDataSource);
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }); 
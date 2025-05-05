import { User } from './user';
import { Category } from './category';
import { Post } from './post';
import { Tag } from './tag';

export interface Thread {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  isActive: boolean;
  isLocked: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  category: Category;
  posts?: Post[];
  tags?: Tag[];
} 
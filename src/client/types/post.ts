import { User } from './user';
import { Thread } from './thread';

export interface Post {
  id: string;
  content: string;
  reactionCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  thread: Thread;
  parent?: Post;
  replies?: Post[];
} 
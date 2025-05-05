import { User } from './user';
import { Post } from './post';
import { Thread } from './thread';

export enum NotificationType {
  REPLY = 'REPLY',
  REACTION = 'REACTION',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM'
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
  recipient: User;
  post?: Post;
  thread?: Thread;
} 
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
} 
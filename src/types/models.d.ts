declare module '@/server/models/User' {
  export class User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin' | 'moderator';
    isModerator: boolean;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    isActive: boolean;
    avatar?: string;
    bio?: string;
    threads: any[];
    posts: any[];
    reactions: any[];
    notifications: any[];
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module '@/server/models/Category' {
  export class Category {
    id: string;
    name: string;
    description?: string;
    order: number;
    isActive: boolean;
    parent: Category | null;
    children: Category[];
    threads: any[];
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module '@/server/models/Thread' {
  export class Thread {
    id: string;
    title: string;
    content: string;
    viewCount: number;
    isActive: boolean;
    isLocked: boolean;
    isPinned: boolean;
    author: any;
    category: any;
    posts: any[];
    tags: any[];
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module '@/server/models/Post' {
  export class Post {
    id: string;
    content: string;
    reactionCount: number;
    isActive: boolean;
    author: any;
    thread: any;
    parent: Post | null;
    replies: Post[];
    reactions: any[];
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module '@/server/models/Tag' {
  export class Tag {
    id: string;
    name: string;
    description?: string;
    usageCount: number;
    threads: any[];
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module '@/server/models/Reaction' {
  export class Reaction {
    id: string;
    type: string;
    user: any;
    post: any;
    createdAt: Date;
  }
}

declare module '@/server/models/Notification' {
  export class Notification {
    id: string;
    type: string;
    content: string;
    isRead: boolean;
    metadata?: Record<string, any>;
    user: any;
    createdAt: Date;
  }
} 
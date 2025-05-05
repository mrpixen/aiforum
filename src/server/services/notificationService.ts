import { Server, Socket } from 'socket.io';
import { Notification } from '../models/Notification';

export class NotificationService {
  private static instance: NotificationService;
  private io: Server;
  private userSockets: Map<string, Socket> = new Map();

  private constructor(io: Server) {
    this.io = io;
  }

  static getInstance(io: Server): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(io);
    }
    return NotificationService.instance;
  }

  registerUserSocket(userId: string, socket: Socket) {
    this.userSockets.set(userId, socket);
    console.log(`User ${userId} connected to notifications`);
  }

  removeUserSocket(userId: string) {
    this.userSockets.delete(userId);
    console.log(`User ${userId} disconnected from notifications`);
  }

  emitNotification(notification: Notification) {
    const userSocket = this.userSockets.get(notification.recipient.id);
    if (userSocket) {
      userSocket.emit('notification', notification);
    }
  }

  emitNotificationRead(notificationId: string, userId: string) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('notification:read', notificationId);
    }
  }

  emitAllNotificationsRead(userId: string) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('notifications:all-read');
    }
  }
} 
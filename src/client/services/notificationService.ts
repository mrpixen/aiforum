import { io, Socket } from 'socket.io-client';
import { Notification } from '../types/notification';

class NotificationService {
  private static instance: NotificationService;
  private socket: Socket;
  private notificationHandlers: ((notification: Notification) => void)[] = [];
  private readHandlers: ((notificationId: string) => void)[] = [];
  private allReadHandlers: (() => void)[] = [];

  private constructor() {
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:4000', {
      withCredentials: true
    });

    this.setupEventListeners();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupEventListeners(): void {
    this.socket.on('notification', (notification: Notification) => {
      this.notificationHandlers.forEach(handler => handler(notification));
    });

    this.socket.on('notification:read', (notificationId: string) => {
      this.readHandlers.forEach(handler => handler(notificationId));
    });

    this.socket.on('notifications:all-read', () => {
      this.allReadHandlers.forEach(handler => handler());
    });
  }

  public authenticate(userId: string): void {
    this.socket.emit('authenticate', userId);
  }

  public onNotification(handler: (notification: Notification) => void): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
    };
  }

  public onNotificationRead(handler: (notificationId: string) => void): () => void {
    this.readHandlers.push(handler);
    return () => {
      this.readHandlers = this.readHandlers.filter(h => h !== handler);
    };
  }

  public onAllNotificationsRead(handler: () => void): () => void {
    this.allReadHandlers.push(handler);
    return () => {
      this.allReadHandlers = this.allReadHandlers.filter(h => h !== handler);
    };
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}

export default NotificationService; 
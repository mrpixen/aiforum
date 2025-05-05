import React, { useEffect, useState } from 'react';
import { Notification } from '../types/notification';
import NotificationService from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  userId: string;
}

const NotificationList: React.FC<NotificationListProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Initialize notification service
    const notificationService = NotificationService.getInstance();
    notificationService.authenticate(userId);

    // Set up real-time notification handlers
    const unsubscribeNew = notificationService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    const unsubscribeRead = notificationService.onNotificationRead((notificationId) => {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    });

    const unsubscribeAllRead = notificationService.onAllNotificationsRead(() => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    });

    return () => {
      unsubscribeNew();
      unsubscribeRead();
      unsubscribeAllRead();
      notificationService.disconnect();
    };
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          credentials: 'include'
        }
      );
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/notifications/read-all`,
        {
          method: 'PATCH',
          credentials: 'include'
        }
      );
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h2>Notifications</h2>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllAsRead} className="mark-all-read">
            Mark all as read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="no-notifications">No notifications</div>
      ) : (
        <ul>
          {notifications.map(notification => (
            <li
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                  </span>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="mark-read"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList; 
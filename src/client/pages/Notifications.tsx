import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import io from 'socket.io-client';
import '../styles/Notifications.css';  // Assume this exists or create it

interface Notification {
  id: string;
  message: string;
  type: 'newPost' | 'newReaction' | 'categoryUpdated';
  relatedId: string;  // e.g., thread or category ID
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const socket = useRef<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view notifications');
      setLoading(false);
      return;
    }

    socket.current = io('http://localhost:4000');

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        } else if (response.data && Array.isArray(response.data.notifications)) {
          setNotifications(response.data.notifications);
        } else {
          console.error('Unexpected API response format:', response.data);
          setNotifications([]);  // Default to empty array
          setError('Unexpected API response format');
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    socket.current.on('newNotification', (newNotification: Notification) => {
      setNotifications(prev => [...prev, newNotification]);
    });

    return () => socket.current.disconnect();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul>
          {notifications.map(notif => (
            <li key={notif.id} className={notif.read ? 'read' : 'unread'}>
              {notif.message}
              {!notif.read && <button onClick={() => markAsRead(notif.id)}>Mark as Read</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications; 
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppNotification {
  _id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'application' | 'pet';
  title: string;
  message: string;
  read: boolean;
  relatedLink?: string;
  createdAt: string;
  recipient?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  /** Called by SocketContext when a new_notification event arrives */
  addNotification: (notif: AppNotification) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotif: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  /** Increments when a real-time notification arrives (use to animate the bell) */
  flashCount: number;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markRead: async () => {},
  markAllRead: async () => {},
  deleteNotif: async () => {},
  fetchNotifications: async () => {},
  flashCount: 0,
});

export const useNotifications = () => useContext(NotificationContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [flashCount, setFlashCount] = useState(0);

  // Stable ref to avoid stale closures in socket handler
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  // ── Fetch from server (initial load + fallback) ───────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // ── Called by SocketContext when 'new_notification' arrives ──────────────
  const addNotification = useCallback((notif: AppNotification) => {
    // Deduplicate — socket might fire twice on reconnect
    if (notificationsRef.current.some(n => n._id === notif._id)) return;
    setNotifications(prev => [notif, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    setFlashCount(prev => prev + 1);
  }, []);

  // ── Mark single as read ───────────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.put(`/notifications/${id}/read`, {});
    } catch (err) {
      console.error('Error marking read:', err);
    }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.put('/notifications/read-all', {});
    } catch (err) {
      console.error('Error marking all read:', err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteNotif = useCallback(async (id: string) => {
    const notif = notificationsRef.current.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('Error deleting notification:', err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, deleteNotif, fetchNotifications, flashCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

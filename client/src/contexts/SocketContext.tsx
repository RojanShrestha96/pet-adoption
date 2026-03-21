import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import type { AppNotification } from './NotificationContext';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({ socket: null, onlineUsers: [] });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();

  // Keep addNotification stable in the event listener via a ref
  const addNotifRef = useRef(addNotification);
  addNotifRef.current = addNotification;

  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('join_user', user._id || user.id);
      });

      // ── Real-time notification listener ──────────────────────────────────
      newSocket.on('new_notification', (notification: AppNotification) => {
        addNotifRef.current(notification);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

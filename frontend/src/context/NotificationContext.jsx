import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { subscribeHttpLog } from '../api/client';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [httpLogs, setHttpLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeHttpLog((entry) => {
      setHttpLogs((prev) => [entry, ...prev].slice(0, 30));
    });
    return unsubscribe;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({ title, message, httpBadge = null, variant = 'success', duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, httpBadge, variant }]);
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const clearHttpLogs = useCallback(() => {
    setHttpLogs([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ toasts, notify, dismissToast, httpLogs, clearHttpLogs }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification debe utilizarse dentro de NotificationProvider');
  }
  return ctx;
}

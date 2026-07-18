import { create } from 'zustand';
import type { SystemInfo, Notification, LogEntry } from '@/types';

interface AppState {
  systemInfo: SystemInfo | null;
  setSystemInfo: (info: SystemInfo) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  direction: 'ltr' | 'rtl';
  toggleDirection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  systemInfo: null,
  setSystemInfo: (info) => set({ systemInfo: info }),
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        { ...log, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      ],
    })),
  clearLogs: () => set({ logs: [] }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  direction: 'ltr',
  toggleDirection: () =>
    set((state) => ({ direction: state.direction === 'ltr' ? 'rtl' : 'ltr' })),
}));

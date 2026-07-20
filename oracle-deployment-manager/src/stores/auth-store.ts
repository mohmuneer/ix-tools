'use client';

import { create } from 'zustand';

export type UserRole = 'admin' | 'user';

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  username: string;
  userId: string;
  login: (username: string, role: UserRole, userId?: string) => void;
  logout: () => void;
  canEdit: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  role: null,
  username: '',
  userId: '',

  login: (username, role, userId = '') => {
    set({ isLoggedIn: true, role, username, userId });
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-role', role);
      localStorage.setItem('auth-username', username);
      localStorage.setItem('auth-user-id', userId);
      document.cookie = `auth-role=${role}; path=/; max-age=${60 * 60 * 24 * 7}`;
      document.cookie = `auth-username=${encodeURIComponent(username)}; path=/; max-age=${60 * 60 * 24 * 7}`;
      document.cookie = `auth-user-id=${userId}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  },

  logout: () => {
    set({ isLoggedIn: false, role: null, username: '', userId: '' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-role');
      localStorage.removeItem('auth-username');
      localStorage.removeItem('auth-user-id');
      document.cookie = 'auth-role=; path=/; max-age=0';
      document.cookie = 'auth-username=; path=/; max-age=0';
      document.cookie = 'auth-user-id=; path=/; max-age=0';
      fetch('/api/logout', { method: 'POST' });
    }
  },

  canEdit: () => {
    return get().role === 'admin';
  },
}));

export function loadAuthFromStorage(): { role: UserRole | null; username: string; userId: string } {
  if (typeof window === 'undefined') return { role: null, username: '', userId: '' };
  try {
    const role = localStorage.getItem('auth-role') as UserRole | null;
    const username = localStorage.getItem('auth-username') || '';
    const userId = localStorage.getItem('auth-user-id') || '';
    return { role, username, userId };
  } catch {
    return { role: null, username: '', userId: '' };
  }
}

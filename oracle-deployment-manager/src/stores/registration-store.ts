'use client';

import { create } from 'zustand';
import type { UserRole } from './auth-store';

export interface RegistrationRequest {
  id: string;
  email: string;
  username: string;
  password: string;
  requestedRole: UserRole;
  createdAt: number;
}

export interface ApprovedUser {
  email: string;
  username: string;
  role: UserRole;
  password: string;
}

interface RegistrationState {
  pendingRequests: RegistrationRequest[];
  approvedUsers: ApprovedUser[];
  loadFromStorage: () => void;
  addRequest: (req: Omit<RegistrationRequest, 'id' | 'createdAt'>) => void;
  approveRequest: (id: string, role?: UserRole) => void;
  rejectRequest: (id: string) => void;
  removeUser: (email: string) => void;
  isEmailApproved: (email: string) => ApprovedUser | null;
}

function save(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  pendingRequests: load<RegistrationRequest[]>('pending-requests', []),
  approvedUsers: load<ApprovedUser[]>('approved-users', []),

  loadFromStorage: () => {
    set({
      pendingRequests: load<RegistrationRequest[]>('pending-requests', []),
      approvedUsers: load<ApprovedUser[]>('approved-users', []),
    });
  },

  addRequest: (req) => {
    const newReq: RegistrationRequest = {
      ...req,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const requests = [...get().pendingRequests, newReq];
    set({ pendingRequests: requests });
    save('pending-requests', requests);
  },

  approveRequest: (id, role) => {
    const req = get().pendingRequests.find((r) => r.id === id);
    if (!req) return;
    const approved: ApprovedUser = {
      email: req.email,
      username: req.username,
      role: role ?? req.requestedRole,
      password: req.password,
    };
    const users = [...get().approvedUsers, approved];
    const requests = get().pendingRequests.filter((r) => r.id !== id);
    set({ approvedUsers: users, pendingRequests: requests });
    save('approved-users', users);
    save('pending-requests', requests);
  },

  rejectRequest: (id) => {
    const requests = get().pendingRequests.filter((r) => r.id !== id);
    set({ pendingRequests: requests });
    save('pending-requests', requests);
  },

  removeUser: (email) => {
    const users = get().approvedUsers.filter((u) => u.email !== email);
    set({ approvedUsers: users });
    save('approved-users', users);
  },

  isEmailApproved: (email) => {
    return get().approvedUsers.find((u) => u.email === email) ?? null;
  },
}));

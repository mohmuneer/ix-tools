'use client';

import { create } from 'zustand';
import type { UserRole } from './auth-store';

const REG_KEY = 'app-registry';

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

interface RegItem {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  status: 'pending' | 'approved';
  createdAt: number;
}

function readAll(): RegItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: RegItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REG_KEY, JSON.stringify(items));
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

function toRequests(items: RegItem[]): RegistrationRequest[] {
  return items.filter((i) => i.status === 'pending').map((i) => ({
    id: i.id,
    email: i.email,
    username: i.username,
    password: i.password,
    requestedRole: i.role as UserRole,
    createdAt: i.createdAt,
  }));
}

function toApproved(items: RegItem[]): ApprovedUser[] {
  return items.filter((i) => i.status === 'approved').map((i) => ({
    email: i.email,
    username: i.username,
    role: i.role as UserRole,
    password: i.password,
  }));
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  pendingRequests: toRequests(readAll()),
  approvedUsers: toApproved(readAll()),

  loadFromStorage: () => {
    const all = readAll();
    set({ pendingRequests: toRequests(all), approvedUsers: toApproved(all) });
  },

  addRequest: (req) => {
    const newItem: RegItem = {
      id: crypto.randomUUID(),
      email: req.email,
      username: req.username,
      password: req.password,
      role: req.requestedRole,
      status: 'pending',
      createdAt: Date.now(),
    };
    const all = readAll();
    all.push(newItem);
    writeAll(all);
    set({ pendingRequests: toRequests(all) });
  },

  approveRequest: (id, role) => {
    const all = readAll();
    const item = all.find((i) => i.id === id && i.status === 'pending');
    if (!item) return;
    item.status = 'approved';
    if (role) item.role = role;
    writeAll(all);
    set({ pendingRequests: toRequests(all), approvedUsers: toApproved(all) });
  },

  rejectRequest: (id) => {
    const all = readAll().filter((i) => i.id !== id);
    writeAll(all);
    set({ pendingRequests: toRequests(all) });
  },

  removeUser: (email) => {
    const all = readAll().filter((i) => !(i.status === 'approved' && i.email === email));
    writeAll(all);
    set({ approvedUsers: toApproved(all) });
  },

  isEmailApproved: (email) => {
    const all = readAll();
    const item = all.find((i) => i.status === 'approved' && i.email === email);
    return item ? { email: item.email, username: item.username, role: item.role as UserRole, password: item.password } : null;
  },
}));

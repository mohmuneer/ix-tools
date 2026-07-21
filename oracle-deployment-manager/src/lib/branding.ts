import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'branding.json');

export interface BrandingData {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    sidebarActive: string;
    background: string;
    surface: string;
  };
  font: {
    family: string;
    size: string;
    borderRadius: string;
  };
  theme: string;
  logo: {
    companyName: string;
    systemName: string;
    logoUrl: string | null;
  };
  login: {
    title: string;
    subtitle: string;
    background: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_BRANDING: BrandingData = {
  colors: {
    primary: '#2563EB',
    secondary: '#0891B2',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    sidebarActive: '#3B82F6',
    background: '#0B1120',
    surface: '#111827',
  },
  font: {
    family: "Inter, 'IBM Plex Sans Arabic', system-ui, sans-serif",
    size: '14px',
    borderRadius: '0.75rem',
  },
  theme: 'corporate_blue',
  logo: {
    companyName: 'Ultimate Solutions',
    systemName: 'Onyx IX',
    logoUrl: '/images/logo.png',
  },
  login: {
    title: 'Onyx IX',
    subtitle: 'System Installation Requirements',
    background: '#0B0F17',
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

let memoryBranding: BrandingData | null = null;

function loadFromDb(): BrandingData | null {
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const row = db.prepare("SELECT data FROM branding WHERE id = 'default'").get();
    if (row && row.data) {
      const data = JSON.parse(row.data) as BrandingData;
      memoryBranding = { ...DEFAULT_BRANDING, ...data };
      return memoryBranding;
    }
  } catch {
    // fall through
  }
  return null;
}

function saveToDb(data: BrandingData): boolean {
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const json = JSON.stringify(data);
    const existing = db.prepare("SELECT id FROM branding WHERE id = 'default'").get();
    if (existing) {
      db.prepare("UPDATE branding SET data = ?, updated_at = datetime('now') WHERE id = 'default'").run(json);
    } else {
      db.prepare("INSERT INTO branding (id, data) VALUES ('default', ?)").run(json);
    }
    return true;
  } catch {
    return false;
  }
}

export function getBranding(): BrandingData {
  // 1. Try database
  const fromDb = loadFromDb();
  if (fromDb) return fromDb;

  // 2. Try filesystem (local dev)
  try {
    if (existsSync(FILE_PATH)) {
      const raw = readFileSync(FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      const result = { ...DEFAULT_BRANDING, ...data };
      memoryBranding = result;
      saveToDb(result);
      return result;
    }
  } catch {
    // fall through
  }

  // 3. Try in-memory (warm instance)
  if (memoryBranding) return memoryBranding;

  // 4. Defaults
  return { ...DEFAULT_BRANDING };
}

export function saveBranding(data: BrandingData): void {
  const toSave = { ...data, updatedAt: new Date().toISOString() };
  memoryBranding = toSave;

  // Save to database
  saveToDb(toSave);

  // Also try filesystem (local dev)
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    writeFileSync(FILE_PATH, JSON.stringify(toSave, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem (Vercel) — already saved to database
  }
}

export function resetBranding(): BrandingData {
  const defaults = { ...DEFAULT_BRANDING, updatedAt: new Date().toISOString() };
  saveBranding(defaults);
  return defaults;
}

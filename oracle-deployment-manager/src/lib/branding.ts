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
    primary: '#18B13A',
    secondary: '#3A3A96',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    sidebarActive: '#15C138',
    background: '#0B0F17',
    surface: '#111827',
  },
  font: {
    family: "Inter, 'IBM Plex Sans Arabic', system-ui, sans-serif",
    size: '14px',
    borderRadius: '0.75rem',
  },
  theme: 'ultimate_default',
  logo: {
    companyName: 'Ultimate Solutions',
    systemName: 'Onyx IX',
    logoUrl: null,
  },
  login: {
    title: 'Onyx IX',
    subtitle: 'System Installation Requirements',
    background: '#0B0F17',
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export function getBranding(): BrandingData {
  try {
    if (existsSync(FILE_PATH)) {
      const raw = readFileSync(FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return { ...DEFAULT_BRANDING, ...data };
    }
  } catch {
    // fall through to defaults
  }
  return { ...DEFAULT_BRANDING };
}

export function saveBranding(data: BrandingData): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  const toSave = { ...data, updatedAt: new Date().toISOString() };
  writeFileSync(FILE_PATH, JSON.stringify(toSave, null, 2), 'utf-8');
}

export function resetBranding(): BrandingData {
  const defaults = { ...DEFAULT_BRANDING, updatedAt: new Date().toISOString() };
  saveBranding(defaults);
  return defaults;
}

import { create } from 'zustand';

export interface BrandingColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  sidebarActive: string;
  background: string;
  surface: string;
}

export interface BrandingFont {
  family: string;
  size: string;
  borderRadius: string;
}

export interface BrandingLogo {
  companyName: string;
  systemName: string;
  logoUrl: string | null;
}

export interface BrandingLogin {
  title: string;
  subtitle: string;
  background: string;
}

export interface BrandingConfig {
  colors: BrandingColors;
  font: BrandingFont;
  theme: string;
  logo: BrandingLogo;
  login: BrandingLogin;
  updatedAt: string;
  updatedBy: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  nameAr: string;
  colors: BrandingColors;
  darkBackground: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'ultimate_default',
    name: 'Ultimate Default',
    nameAr: 'الافتراضي',
    darkBackground: true,
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
  },
  {
    id: 'dark_emerald',
    name: 'Dark Emerald',
    nameAr: 'زمردي داكن',
    darkBackground: true,
    colors: {
      primary: '#10B981',
      secondary: '#6366F1',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      sidebarActive: '#059669',
      background: '#0F172A',
      surface: '#1E293B',
    },
  },
  {
    id: 'corporate_blue',
    name: 'Corporate Blue',
    nameAr: 'أزرار مؤسسي',
    darkBackground: true,
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
  },
  {
    id: 'green_professional',
    name: 'Green Professional',
    nameAr: 'أخضر مهني',
    darkBackground: true,
    colors: {
      primary: '#059669',
      secondary: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#DC2626',
      sidebarActive: '#047857',
      background: '#0B0F17',
      surface: '#111827',
    },
  },
  {
    id: 'light_clean',
    name: 'Light Clean',
    nameAr: 'فاتح نظيف',
    darkBackground: false,
    colors: {
      primary: '#16A34A',
      secondary: '#2563EB',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      sidebarActive: '#15803D',
      background: '#F8FAFC',
      surface: '#FFFFFF',
    },
  },
  {
    id: 'light_ocean',
    name: 'Light Ocean',
    nameAr: 'فاتح محيطي',
    darkBackground: false,
    colors: {
      primary: '#0284C7',
      secondary: '#7C3AED',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
      sidebarActive: '#0369A1',
      background: '#F0F9FF',
      surface: '#FFFFFF',
    },
  },
];

export const FONT_PRESETS = [
  { value: "Inter, 'IBM Plex Sans Arabic', system-ui, sans-serif", label: 'Inter + IBM Plex Arabic' },
  { value: "'IBM Plex Sans Arabic', Inter, system-ui, sans-serif", label: 'IBM Plex Arabic' },
  { value: "Cairo, 'IBM Plex Sans Arabic', system-ui, sans-serif", label: 'Cairo' },
  { value: "Roboto, system-ui, sans-serif", label: 'Roboto' },
  { value: "'Open Sans', system-ui, sans-serif", label: 'Open Sans' },
  { value: "'Noto Sans Arabic', 'IBM Plex Sans Arabic', system-ui, sans-serif", label: 'Noto Sans Arabic' },
];

const DEFAULT_CONFIG: BrandingConfig = {
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

interface BrandingState {
  config: BrandingConfig;
  loaded: boolean;
  setConfig: (config: Partial<BrandingConfig>) => void;
  applyBranding: () => void;
  applyColors: (colors: BrandingColors) => void;
  fetchBranding: () => Promise<void>;
  saveBranding: () => Promise<boolean>;
  resetBranding: () => Promise<boolean>;
  uploadLogo: (file: File) => Promise<string | null>;
}

function applyCSSVariables(colors?: BrandingColors, font?: BrandingFont) {
  if (typeof document === 'undefined' || !colors || !font) return;
  const root = document.documentElement;

  root.style.setProperty('--brand-primary', colors.primary);
  root.style.setProperty('--brand-secondary', colors.secondary);
  root.style.setProperty('--brand-success', colors.success);
  root.style.setProperty('--brand-warning', colors.warning);
  root.style.setProperty('--brand-danger', colors.danger);
  root.style.setProperty('--brand-sidebar-active', colors.sidebarActive);
  root.style.setProperty('--brand-background', colors.background);
  root.style.setProperty('--brand-surface', colors.surface);
  root.style.setProperty('--brand-radius', font.borderRadius);
  root.style.setProperty('--brand-font', font.family);
  root.style.setProperty('--brand-font-size', font.size);

  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', '#FFFFFF');
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', '#FFFFFF');
  root.style.setProperty('--destructive', colors.danger);
  root.style.setProperty('--ring', colors.primary);
  root.style.setProperty('--chart-1', colors.primary);
  root.style.setProperty('--chart-2', colors.secondary);
  root.style.setProperty('--chart-3', colors.warning);
  root.style.setProperty('--chart-5', colors.danger);
  root.style.setProperty('--radius', font.borderRadius);
  root.style.setProperty('--sidebar-primary', colors.primary);
  root.style.setProperty('--sidebar-primary-foreground', '#FFFFFF');
  root.style.setProperty('--sidebar-ring', colors.primary);
}

export const useBrandingStore = create<BrandingState>((set, get) => ({
  config: DEFAULT_CONFIG,
  loaded: false,

  setConfig: (updates) => {
    set((state) => ({
      config: { ...state.config, ...updates },
    }));
  },

  applyBranding: () => {
    const { config } = get();
    applyCSSVariables(config.colors, config.font);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-branding', JSON.stringify(config));
    }
  },

  applyColors: (colors) => {
    const { config } = get();
    applyCSSVariables(colors, config.font);
  },

  fetchBranding: async () => {
    try {
      const res = await fetch('/api/branding');
      if (res.ok) {
        const data = await res.json();
        const current = get().config;
        const merged = { ...DEFAULT_CONFIG, ...data };
        if (!merged.logo.logoUrl && current.logo.logoUrl) {
          merged.logo.logoUrl = current.logo.logoUrl;
        }
        if (!merged.logo.systemName || merged.logo.systemName === 'Onyx IX') {
          merged.logo.systemName = current.logo.systemName;
        }
        if (!merged.logo.companyName || merged.logo.companyName === 'Ultimate Solutions') {
          merged.logo.companyName = current.logo.companyName;
        }
        set({ config: merged, loaded: true });
        get().applyBranding();
      } else {
        set({ loaded: true });
        get().applyBranding();
      }
    } catch {
      set({ loaded: true });
      get().applyBranding();
    }
  },

  saveBranding: async () => {
    const { config } = get();
    try {
      const res = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        set({ config: data });
        get().applyBranding();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  resetBranding: async () => {
    try {
      const res = await fetch('/api/admin/branding/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        set({ config: { ...DEFAULT_CONFIG, ...data } });
        get().applyBranding();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  uploadLogo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      const res = await fetch('/api/admin/branding/logo', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const { logoUrl } = await res.json();
        const { config, setConfig } = get();
        setConfig({ logo: { ...config.logo, logoUrl } });
        return logoUrl;
      }
      return null;
    } catch {
      return null;
    }
  },
}));

function migrateOldBranding(raw: any): BrandingConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.colors && typeof raw.colors === 'object' && 'primary' in raw.colors) {
    return raw as BrandingConfig;
  }
  if (raw.primaryColor || raw.secondaryColor) {
    return {
      colors: {
        primary: raw.primaryColor || '#18B13A',
        secondary: raw.secondaryColor || '#3A3A96',
        success: raw.successColor || '#22C55E',
        warning: raw.warningColor || '#F59E0B',
        danger: raw.errorColor || '#EF4444',
        sidebarActive: raw.primaryColor || '#15C138',
        background: raw.backgroundColor || '#0B0F17',
        surface: raw.cardColor || raw.headerColor || '#111827',
      },
      font: {
        family: raw.fontFamily || "Inter, 'IBM Plex Sans Arabic', system-ui, sans-serif",
        size: raw.fontSize || '14px',
        borderRadius: raw.borderRadius || '0.75rem',
      },
      theme: raw.theme || 'ultimate_default',
      logo: {
        companyName: raw.companyName || 'Ultimate Solutions',
        systemName: raw.systemName || 'Onyx IX',
        logoUrl: raw.logoUrl || null,
      },
      login: {
        title: raw.loginTitle || 'Onyx IX',
        subtitle: raw.loginSubtitle || 'System Installation Requirements',
        background: raw.loginBackground || '#0B0F17',
      },
      updatedAt: raw.updatedAt || new Date().toISOString(),
      updatedBy: raw.updatedBy || 'system',
    };
  }
  return null;
}

export function loadBrandingFromStorage(): BrandingConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('app-branding');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const migrated = migrateOldBranding(parsed);
    if (migrated) {
      localStorage.setItem('app-branding', JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return null;
  }
}

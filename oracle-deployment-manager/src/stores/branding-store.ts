import { create } from 'zustand';

export interface BrandingConfig {
  systemName: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  backgroundColor: string;
  headerColor: string;
  sidebarColor: string;
  cardColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  theme: string;
  logoUrl: string;
  sidebarLogoUrl: string;
  loginLogoUrl: string;
  faviconUrl: string;
  reportLogoUrl: string;
  loginBackground: string;
  loginTitle: string;
  loginSubtitle: string;
}

interface BrandingState {
  config: BrandingConfig;
  setConfig: (config: Partial<BrandingConfig>) => void;
  applyBranding: () => void;
}

const defaultConfig: BrandingConfig = {
  systemName: 'Oracle Deployment Manager',
  companyName: 'Ultimate Solutions',
  primaryColor: '#16a34a',
  secondaryColor: '#2563eb',
  successColor: '#22c55e',
  warningColor: '#f59e0b',
  errorColor: '#ef4444',
  backgroundColor: '#ffffff',
  headerColor: '#ffffff',
  sidebarColor: '#f8fafc',
  cardColor: '#ffffff',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
  borderRadius: '0.625rem',
  theme: 'default',
  logoUrl: '',
  sidebarLogoUrl: '',
  loginLogoUrl: '',
  faviconUrl: '',
  reportLogoUrl: '',
  loginBackground: '',
  loginTitle: 'Oracle Deployment Manager',
  loginSubtitle: 'Sign in to your account',
};

export const useBrandingStore = create<BrandingState>((set, get) => ({
  config: defaultConfig,

  setConfig: (updates) => {
    set((state) => ({
      config: { ...state.config, ...updates },
    }));
    const newConfig = { ...get().config, ...updates };
    get().applyBranding();
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-branding', JSON.stringify(newConfig));
    }
  },

  applyBranding: () => {
    const { config } = get();
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--brand-primary', config.primaryColor);
    root.style.setProperty('--brand-secondary', config.secondaryColor);
    root.style.setProperty('--brand-success', config.successColor);
    root.style.setProperty('--brand-warning', config.warningColor);
    root.style.setProperty('--brand-error', config.errorColor);
    root.style.setProperty('--brand-bg', config.backgroundColor);
    root.style.setProperty('--brand-header', config.headerColor);
    root.style.setProperty('--brand-sidebar', config.sidebarColor);
    root.style.setProperty('--brand-card', config.cardColor);
    root.style.setProperty('--brand-radius', config.borderRadius);
    root.style.setProperty('--brand-font', config.fontFamily);
    root.style.setProperty('--brand-font-size', config.fontSize);
  },
}));

export function loadBrandingFromStorage(): Partial<BrandingConfig> | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('app-branding');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

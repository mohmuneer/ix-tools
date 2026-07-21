'use client';

import { useEffect } from 'react';
import { useBrandingStore, loadBrandingFromStorage } from '@/stores/branding-store';

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { fetchBranding, applyBranding } = useBrandingStore();

  useEffect(() => {
    const stored = loadBrandingFromStorage();
    if (stored && stored.colors) {
      useBrandingStore.setState({ config: stored });
      applyBranding();
    }
    fetchBranding();
  }, []);

  const config = useBrandingStore((s) => s.config);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      localStorage.setItem('app-branding', JSON.stringify(config));
    }
  }, [config]);

  return <>{children}</>;
}

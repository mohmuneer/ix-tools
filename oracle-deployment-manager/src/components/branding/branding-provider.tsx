'use client';

import { useEffect } from 'react';
import { useBrandingStore, loadBrandingFromStorage } from '@/stores/branding-store';

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { setConfig } = useBrandingStore();

  useEffect(() => {
    const stored = loadBrandingFromStorage();
    if (stored) {
      setConfig(stored);
    }
  }, [setConfig]);

  return <>{children}</>;
}

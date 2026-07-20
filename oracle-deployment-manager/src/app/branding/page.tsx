'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { BrandingSettings } from '@/components/branding/branding-settings';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function BrandingPage() {
  const { t, isRTL } = useLocale();
  const role = useAuthStore((s) => s.role);
  const router = useRouter();

  useEffect(() => {
    if (role && role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [role, router]);

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#18B13A]" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-background, #0B0F17)' }}>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('branding.title')}</h1>
            <p className="text-slate-500">{t('branding.subtitle')}</p>
          </div>
          <BrandingSettings />
        </div>
      </div>
    </AppLayout>
  );
}

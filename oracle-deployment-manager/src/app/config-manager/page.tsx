'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ConfigManager } from '@/components/config-manager/config-manager';
import { useLocale } from '@/hooks/use-locale';

export default function ConfigManagerPage() {
  const { t } = useLocale();
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{t('configManager.title')}</h1>
          <p className="text-muted-foreground">{t('configManager.subtitle')}</p>
        </div>
        <ConfigManager />
      </div>
    </AppLayout>
  );
}

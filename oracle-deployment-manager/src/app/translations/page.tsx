'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { TranslationManager } from '@/components/i18n/translation-manager';

export default function TranslationsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <TranslationManager />
      </div>
    </AppLayout>
  );
}

'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { RollbackManager } from '@/components/rollback/rollback-manager';

export default function RollbackPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <RollbackManager />
      </div>
    </AppLayout>
  );
}

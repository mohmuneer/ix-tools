'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { LogViewer } from '@/components/logs/log-viewer';

export default function LogsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <LogViewer />
      </div>
    </AppLayout>
  );
}

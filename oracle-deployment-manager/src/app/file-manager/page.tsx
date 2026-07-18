'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { FileManager } from '@/components/file-manager/file-manager';

export default function FileManagerPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-muted-foreground">Browse and manage files on the server</p>
        </div>
        <FileManager />
      </div>
    </AppLayout>
  );
}

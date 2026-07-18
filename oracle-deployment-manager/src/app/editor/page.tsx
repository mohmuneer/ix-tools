'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SmartEditor } from '@/components/editor/smart-editor';

export default function EditorPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Smart Editor</h1>
          <p className="text-muted-foreground">Professional text editor with syntax highlighting</p>
        </div>
        <SmartEditor />
      </div>
    </AppLayout>
  );
}

'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { DeploymentDocs } from '@/components/deployment/deployment-docs';
import { BookOpen } from 'lucide-react';

export default function DeploymentPage() {
  return (
    <AppLayout>
      <div dir="rtl" className="space-y-4 text-right">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">توثيق النظام</h1>
            <p className="text-muted-foreground text-sm">
              توثيق وتثبيت النظام للمهندسين والمحاسبين
            </p>
          </div>
        </div>
        <DeploymentDocs />
      </div>
    </AppLayout>
  );
}

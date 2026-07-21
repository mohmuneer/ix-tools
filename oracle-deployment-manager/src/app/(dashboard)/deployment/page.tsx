'use client';

import { DeploymentDocs } from '@/components/deployment/deployment-docs';
import { BookOpen } from 'lucide-react';

export default function DeploymentPage() {
  return (
    <div dir="rtl" className="us-page-bg min-h-screen space-y-4 text-end">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#18B13A] to-[#15803D]">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div className="text-end">
          <h1 className="text-2xl font-bold text-white">توثيق النظام</h1>
          <p className="text-slate-500 text-sm">
            توثيق وتثبيت النظام للمهندسين والمحاسبين
          </p>
        </div>
      </div>
      <DeploymentDocs />
    </div>
  );
}

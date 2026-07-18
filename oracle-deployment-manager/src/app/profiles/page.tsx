'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ProfileManager } from '@/components/profiles/profile-manager';

export default function ProfilesPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <ProfileManager />
      </div>
    </AppLayout>
  );
}

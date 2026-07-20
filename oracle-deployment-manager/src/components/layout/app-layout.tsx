'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();
  const { isRTL } = useLocale();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-background, #0B0F17)' }}>
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen flex flex-col',
          'ms-0 md:ms-[72px]',
          sidebarOpen && 'md:!ms-64'
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, loadAuthFromStorage } from '@/stores/auth-store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const stored = loadAuthFromStorage();
    if (stored.role) {
      login(stored.username, stored.role);
    }
    setInitialized(true);
  }, [login]);

  useEffect(() => {
    if (!initialized) return;
    const stored = loadAuthFromStorage();
    if (!stored.role && pathname !== '/login' && pathname !== '/register') {
      setRedirecting(true);
      router.replace('/login');
    }
  }, [initialized, pathname, router]);

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <div className="h-8 w-8 border-2 border-[#18B13A]/30 border-t-[#18B13A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <div className="h-8 w-8 border-2 border-[#18B13A]/30 border-t-[#18B13A] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

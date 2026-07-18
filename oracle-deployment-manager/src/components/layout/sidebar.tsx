'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import {
  LayoutDashboard,
  FolderOpen,
  Settings2,
  Code2,
  Rocket,
  UserCircle2,
  Copy,
  RotateCcw,
  ScrollText,
  Shield,
  ChevronFirst,
  ChevronLast,
  Database,
  Languages,
  Paintbrush,
  Package,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/hooks/use-locale';
import { useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { t, isRTL } = useLocale();

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/architecture', label: t('nav.architecture'), icon: Layers },
    { href: '/file-manager', label: t('nav.fileManager'), icon: FolderOpen },
    { href: '/config-manager', label: t('nav.configManager'), icon: Settings2 },
    { href: '/editor', label: t('nav.smartEditor'), icon: Code2 },
    { href: '/deployment', label: t('nav.deployment'), icon: Rocket },
    { href: '/profiles', label: t('nav.profiles'), icon: UserCircle2 },
    { href: '/templates', label: t('nav.templates'), icon: Copy },
    { href: '/rollback', label: t('nav.rollback'), icon: RotateCcw },
    { href: '/logs', label: t('nav.logs'), icon: ScrollText },
    { href: '/sw-deploy', label: t('nav.swDeploy'), icon: Package },
    { href: '/translations', label: t('nav.translations'), icon: Languages },
    { href: '/branding', label: t('nav.branding'), icon: Paintbrush },
  ];

  const ChevronCollapse = isRTL ? ChevronFirst : ChevronLast;
  const ChevronExpand = isRTL ? ChevronLast : ChevronFirst;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileMenuOpen]);

  const isExpanded = sidebarOpen;

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 z-40 h-screen bg-card transition-all duration-300 flex flex-col',
          isRTL ? 'right-0 border-l' : 'left-0 border-r',
          // Desktop: use sidebarOpen state
          'hidden md:flex',
          isExpanded ? 'w-64' : 'w-16',
          // Mobile: always w-64, slide in/out
          mobileMenuOpen && 'flex !w-64'
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 px-4 h-16 border-b shrink-0">
          <Database className="h-6 w-6 text-orange-500 shrink-0" />
          {isExpanded && (
            <div className="overflow-hidden flex-1 text-start">
              <h1 className="font-bold text-sm leading-tight">{t('app.shortName')}</h1>
              <p className="text-[10px] text-muted-foreground">{t('app.description')}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  {isActive && (
                    <span
                      className={cn(
                        'absolute top-1 bottom-1 w-[3px] rounded-full bg-primary',
                        isRTL ? 'left-0' : 'right-0'
                      )}
                    />
                  )}
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
                  {isExpanded && (
                    <span className="flex-1 text-start truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Settings link */}
        <div className="p-2 shrink-0">
          <Link
            href="/settings"
            className={cn(
              'relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200',
              pathname === '/settings'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {pathname === '/settings' && (
              <span
                className={cn(
                  'absolute top-1 bottom-1 w-[3px] rounded-full bg-primary',
                  isRTL ? 'left-0' : 'right-0'
                )}
              />
            )}
            <Shield className={cn('h-4 w-4 shrink-0', pathname === '/settings' && 'text-primary')} />
            {isExpanded && <span className="flex-1 text-start">{t('nav.settings')}</span>}
          </Link>
        </div>

        {/* Collapse/Expand button - desktop only */}
        <div className="p-2 border-t shrink-0 hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <ChevronCollapse className="h-4 w-4" />
            ) : (
              <ChevronExpand className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
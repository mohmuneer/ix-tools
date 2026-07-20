'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useDashboardStore } from '@/stores/dashboard-store';
import {
  LayoutDashboard,
  Rocket,
  Copy,
  Shield,
  ChevronFirst,
  ChevronLast,
  Database,
  Paintbrush,
  Package,
  Layers,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore } from '@/stores/auth-store';
import { useBrandingStore } from '@/stores/branding-store';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { t, isRTL } = useLocale();
  const { data: dashboardData, init } = useDashboardStore();
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const config = useBrandingStore((s) => s.config);

  useEffect(() => {
    init();
  }, [init]);

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, group: 'main' },
    { href: '/architecture', label: t('nav.architecture'), icon: Layers, group: 'main' },
    { href: '/sw-deploy', label: isRTL ? 'خطوات بعد التركيب' : 'Post-Install Steps', icon: Package, group: 'main' },
    { href: '/questionnaire', label: isRTL ? 'استبيان العميل' : 'Questionnaire', icon: ClipboardList, group: 'main' },
    { href: '/deployment', label: t('nav.deployment'), icon: Rocket, group: 'docs' },
    { href: '/templates', label: t('nav.templates'), icon: Copy, group: 'docs' },
    { href: '/branding', label: t('nav.branding'), icon: Paintbrush, group: 'settings' },
  ];

  const ChevronCollapse = isRTL ? ChevronFirst : ChevronLast;
  const ChevronExpand = isRTL ? ChevronLast : ChevronFirst;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

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

  const groupLabels: Record<string, string> = {
    main: isRTL ? 'الرئيسية' : 'Main',
    docs: isRTL ? 'التوثيق' : 'Documentation',
    settings: isRTL ? 'الإعدادات' : 'Settings',
  };

  let lastGroup = '';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed top-0 z-40 h-screen transition-all duration-300 flex flex-col',
          'dark:bg-[#0F1520]',
          isRTL ? 'right-0 border-l border-white/[0.06]' : 'left-0 border-r border-white/[0.06]',
          'hidden md:flex',
          isExpanded ? 'w-64' : 'w-[72px]',
          mobileMenuOpen && 'flex !w-64'
        )}
        style={{ backgroundColor: 'var(--brand-surface, #0F1520)' }}
      >
        {/* Logo / Brand */}
        <div className={cn(
          'flex items-center gap-3 h-16 border-b border-white/[0.06] shrink-0',
          isExpanded ? 'px-4' : 'px-0 justify-center'
        )}>
          <div className="relative shrink-0">
            {config?.logo?.logoUrl ? (
              <img src={config.logo.logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, var(--brand-primary, #18B13A), var(--brand-sidebar-active, #15803D))`, boxShadow: '0 4px 12px var(--brand-primary, #18B13A)33' }}>
                <Database className="h-4.5 w-4.5 text-white" />
              </div>
            )}
          </div>
          {isExpanded && (
            <div className="overflow-hidden flex-1 min-w-0">
              <h1 className="font-bold text-sm text-white leading-tight truncate">{dashboardData.pageTitles.sidebarAppName}</h1>
              <p className="text-[10px] text-slate-500 truncate">{dashboardData.pageTitles.sidebarAppSubtitle}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const showGroup = item.group !== lastGroup && isExpanded;
              if (item.group !== lastGroup) lastGroup = item.group;

              return (
                <div key={item.href}>
                  {showGroup && (
                    <div className={cn(
                      'px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600',
                      isRTL && 'text-end'
                    )}>
                      {groupLabels[item.group]}
                    </div>
                  )}
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200',
                      isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
                      isActive
                        ? 'font-medium'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                    )}
                    style={isActive ? { backgroundColor: `${config.colors.primary}15`, color: config.colors.primary } : undefined}
                    title={!isExpanded ? item.label : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className={cn(
                        'absolute top-1.5 bottom-1.5 w-[3px] rounded-full',
                        isRTL ? 'left-0' : 'right-0'
                      )} style={{ backgroundColor: config.colors.sidebarActive }} />
                    )}
                    <item.icon className={cn(
                      'shrink-0 transition-colors',
                      isExpanded ? 'h-[18px] w-[18px]' : 'h-5 w-5',
                    )} style={isActive ? { color: config.colors.primary } : undefined} />
                    {isExpanded && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-white/[0.06]" />

        {/* Admin link */}
        {role === 'admin' && (
          <div className="p-2 shrink-0">
            <Link
              href="/admin/users"
              className={cn(
                'relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200',
                isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
                pathname.startsWith('/admin')
                  ? 'font-medium'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              )}
              style={pathname.startsWith('/admin') ? { backgroundColor: `${config.colors.primary}15`, color: config.colors.primary } : undefined}
            >
              {pathname.startsWith('/admin') && (
                <span className={cn(
                  'absolute top-1.5 bottom-1.5 w-[3px] rounded-full',
                  isRTL ? 'left-0' : 'right-0'
                )} style={{ backgroundColor: config.colors.sidebarActive }} />
              )}
              <Shield className={cn('shrink-0', isExpanded ? 'h-[18px] w-[18px]' : 'h-5 w-5')} style={pathname.startsWith('/admin') ? { color: config.colors.primary } : undefined} />
              {isExpanded && <span className="flex-1 truncate">{isRTL ? 'المستخدمين' : 'Users'}</span>}
            </Link>
          </div>
        )}

        {/* Settings link */}
        <div className="p-2 shrink-0">
            <Link
              href="/settings"
              className={cn(
                'relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200',
                isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
                pathname === '/settings'
                  ? 'font-medium'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              )}
              style={pathname === '/settings' ? { backgroundColor: `${config.colors.primary}15`, color: config.colors.primary } : undefined}
            >
              {pathname === '/settings' && (
                <span className={cn(
                  'absolute top-1.5 bottom-1.5 w-[3px] rounded-full',
                  isRTL ? 'left-0' : 'right-0'
                )} style={{ backgroundColor: config.colors.sidebarActive }} />
              )}
              <Shield className={cn('shrink-0', isExpanded ? 'h-[18px] w-[18px]' : 'h-5 w-5')} style={pathname === '/settings' ? { color: config.colors.primary } : undefined} />
            {isExpanded && <span className="flex-1 truncate">{t('nav.settings')}</span>}
          </Link>
        </div>

        {/* Logout button */}
        <div className="p-2 shrink-0">
          <button
            onClick={() => { logout(); router.replace('/login'); }}
            className={cn(
              'relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200 w-full',
              isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
              'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
            )}
          >
            <LogOut className={cn('shrink-0', isExpanded ? 'h-[18px] w-[18px]' : 'h-5 w-5')} />
            {isExpanded && <span className="flex-1 truncate">{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>

        {/* Collapse/Expand button - desktop only */}
        <div className="p-2 border-t border-white/[0.06] shrink-0 hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] rounded-xl h-9"
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
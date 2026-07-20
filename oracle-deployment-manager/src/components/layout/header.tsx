'use client';

import { useAppStore } from '@/stores/app-store';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Moon,
  Sun,
  Search,
  Menu,
  Database,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { notifications, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { t, isRTL } = useLocale();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#0F1520]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#18B13A] to-[#15803D] flex items-center justify-center">
            <Database className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-white">IX</span>
        </div>

        <div className="relative hidden md:block">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500',
            'end-3'
          )} />
          <Input
            placeholder={t('common.search')}
            className={cn('w-72 ps-9 bg-white/[0.04] border-white/[0.06] text-sm text-slate-300 placeholder:text-slate-600 focus:border-[#18B13A]/40 focus:ring-[#18B13A]/20 rounded-xl')}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-sm font-medium hover:bg-white/[0.06] text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18B13A] relative cursor-pointer transition-colors">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className={cn(
                'absolute h-4 w-4 flex items-center justify-center p-0 text-[9px] font-bold',
                '-top-0.5 -end-0.5 bg-[#18B13A] text-white border-2 border-[#0F1520]'
              )}>
                {unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-80 max-h-[70vh] bg-[#1E293B] border-white/[0.06] rounded-xl shadow-2xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-slate-300 font-semibold">{t('dashboard.recentActivity')}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                {t('dashboard.noActivity')}
              </div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className={cn(
                    'flex flex-col p-3 text-start',
                    isRTL ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
                      <Badge
                        variant={
                          n.type === 'success'
                            ? 'default'
                            : n.type === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className={cn(
                          'text-[10px] font-mono',
                          n.type === 'success' && 'bg-[#18B13A]/20 text-[#4ADE80] border-[#18B13A]/30',
                          n.type === 'error' && 'bg-red-500/20 text-red-400 border-red-500/30',
                          n.type === 'warning' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                          n.type === 'info' && 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                        )}
                      >
                        {n.type}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1 text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
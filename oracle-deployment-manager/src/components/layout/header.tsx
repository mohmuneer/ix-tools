'use client';

import { useAppStore } from '@/stores/app-store';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Moon,
  Sun,
  Search,
  Menu,
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
    <header className={cn(
      'h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 shrink-0',
      isRTL && 'flex-row-reverse'
    )}>
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden md:block">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
            'end-3'
          )} />
          <Input
            placeholder={t('common.search')}
            className={cn('w-72 ps-9')}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <LanguageSwitcher />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center size-9 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring relative cursor-pointer">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className={cn(
                'absolute h-5 w-5 flex items-center justify-center p-0 text-[10px]',
                '-top-1 -end-1'
              )}>
                {unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-80 max-h-[70vh]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('dashboard.recentActivity')}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
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
                        className="text-[10px]"
                      >
                        {n.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
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
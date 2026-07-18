'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SystemInfoCards } from '@/components/dashboard/system-info-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ServerStats } from '@/components/dashboard/server-stats';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { setSystemInfo, systemInfo } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { t, isRTL } = useLocale();

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/system');
      const data = await res.json();
      setSystemInfo(data);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 30000);
    return () => clearInterval(interval);
  }, [setSystemInfo]);

  const allServicesOk = systemInfo && systemInfo.weblogicStatus === 'running' && systemInfo.databaseStatus === 'running';

  return (
    <AppLayout>
      <div className="us-page-bg min-h-screen">
        <div className="space-y-6 max-w-[1400px] mx-auto">

          {/* Enterprise Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#18B13A] to-[#15803D] flex items-center justify-center shadow-lg shadow-[#18B13A]/20">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                {allServicesOk && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#0B0F17] status-dot text-[#22C55E]" />
                )}
              </div>
              <div className={cn('space-y-0.5', isRTL && 'text-end')}>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <h1 className="text-xl font-bold text-white tracking-tight">{t('nav.dashboard')}</h1>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-[#18B13A]/10 text-[#4ADE80] border-[#18B13A]/20">
                    {isRTL ? 'مباشر' : 'Live'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {t('app.description')}
                </p>
              </div>
            </div>
            <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              {lastRefresh && (
                <div className={cn('flex items-center gap-1.5 text-[10px] text-slate-500', isRTL && 'flex-row-reverse')}>
                  <Clock className="h-3 w-3" />
                  {isRTL ? 'آخر تحديث:' : 'Updated:'} {lastRefresh.toLocaleTimeString()}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSystemInfo}
                disabled={loading}
                className="gap-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
          </motion.div>

          {/* System Info Cards */}
          <SystemInfoCards info={systemInfo} loading={loading} />

          {/* Main Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <QuickActions />
              <ServerStats info={systemInfo} />
            </div>
            <div className="space-y-4">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
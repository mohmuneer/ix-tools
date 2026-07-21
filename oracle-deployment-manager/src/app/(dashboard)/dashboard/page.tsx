'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SystemInfoCards } from '@/components/dashboard/system-info-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DashboardDataEditor } from '@/components/dashboard/dashboard-data-editor';
import { useAppStore } from '@/stores/app-store';
import { useDashboardStore } from '@/stores/dashboard-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  RefreshCw,
  Clock,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportRequirementsPDF, exportRequirementsExcel } from '@/lib/export-requirements';
import { CanEdit } from '@/components/ui/can-edit';

export default function DashboardPage() {
  const { setSystemInfo, systemInfo } = useAppStore();
  const { data, init } = useDashboardStore();
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const { t, isRTL } = useLocale();

  useEffect(() => {
    init();
  }, [init]);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/system');
      const d = await res.json();
      setSystemInfo(d);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
  }, [setSystemInfo]);

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchSystemInfo();
    }
    const interval = setInterval(fetchSystemInfo, 30000);
    return () => clearInterval(interval);
  }, [fetchSystemInfo]);

  const allServicesOk = systemInfo && systemInfo.weblogicStatus === 'running' && systemInfo.databaseStatus === 'running';

  const handleExportPDF = useCallback(() => {
    exportRequirementsPDF(data, isRTL);
  }, [data, isRTL]);

  const handleExportExcel = useCallback(() => {
    exportRequirementsExcel(data, isRTL);
  }, [data, isRTL]);

  return (
    <div className="us-page-bg min-h-screen">
      <div className="space-y-6 max-w-[1400px] mx-auto">

        {/* Enterprise Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#18B13A] to-[#15803D] flex items-center justify-center shadow-lg shadow-[#18B13A]/20">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              {allServicesOk && (
                <div className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#0B0F17] status-dot text-[#22C55E]" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{data.pageTitles.dashboardTitle || t('nav.dashboard')}</h1>
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-[#18B13A]/10 text-[#4ADE80] border-[#18B13A]/20">
                  {isRTL ? 'مباشر' : 'Live'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                {data.pageTitles.dashboardDescription || t('app.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Clock className="h-3 w-3" />
                {isRTL ? 'آخر تحديث:' : 'Updated:'} {lastRefresh.toLocaleTimeString()}
              </div>
            )}
            <CanEdit>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorOpen(true)}
                className="gap-1.5 text-xs text-[#FF9800] hover:text-[#FF9800] hover:bg-[#FF9800]/10 rounded-xl"
              >
                <Pencil className="h-3.5 w-3.5" />
                {isRTL ? 'تعديل' : 'Edit'}
              </Button>
            </CanEdit>
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

        {/* Server Specifications */}
        <SystemInfoCards
          onEdit={() => setEditorOpen(true)}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        {/* Main Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-3 space-y-4">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>

    {/* Editor Dialog */}
    <CanEdit>
      <DashboardDataEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
    </CanEdit>
  );
}

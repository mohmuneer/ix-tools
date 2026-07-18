'use client';

import { motion } from 'framer-motion';
import type { SystemInfo } from '@/types';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Server, Info } from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function ServerStats({ info }: { info: SystemInfo | null }) {
  const { t, isRTL } = useLocale();

  if (!info) return null;

  const rows = [
    { label: t('dashboard.hostname'), value: info.hostname },
    { label: t('dashboard.os'), value: info.os },
    { label: t('dashboard.windowsVersion'), value: info.windowsVersion },
    { label: t('dashboard.javaVersion'), value: info.javaVersion || 'N/A' },
    { label: t('dashboard.oracleForms'), value: info.formsVersion || 'N/A' },
    { label: t('dashboard.oracleReports'), value: info.reportsVersion || 'N/A' },
    { label: t('dashboard.diskTotal'), value: formatBytes(info.diskSpace.total) },
    { label: t('dashboard.diskFree'), value: formatBytes(info.diskSpace.free) },
    { label: t('dashboard.memoryTotal'), value: formatBytes(info.memory.total) },
    { label: t('dashboard.cpuCores'), value: String(info.cpu.cores) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className={cn('flex items-center gap-2 px-5 py-3 border-b border-white/5', isRTL && 'flex-row-reverse')}>
        <Server className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold">{t('dashboard.serverDetails')}</span>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.02 * i }}
              className={cn(
                'flex justify-between items-center py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors',
                i < rows.length - 1 && 'border-b border-white/[0.03]',
                isRTL && 'flex-row-reverse'
              )}
            >
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-xs font-medium font-mono">{row.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

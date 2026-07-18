'use client';

import { motion } from 'framer-motion';
import {
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Database,
  Globe,
  Activity,
  Server,
  Loader2,
} from 'lucide-react';
import type { SystemInfo } from '@/types';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

function StatusDot({ status }: { status: string }) {
  return (
    <span className="relative flex items-center justify-center">
      <span className={cn(
        'w-2 h-2 rounded-full status-dot',
        status === 'running' ? 'bg-emerald-500 text-emerald-500' :
        status === 'stopped' ? 'bg-red-500 text-red-500' :
        'bg-amber-500 text-amber-500'
      )} />
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function ProgressRing({ percent, color, size = 40 }: { percent: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
      />
    </svg>
  );
}

interface Props {
  info: SystemInfo | null;
  loading: boolean;
}

const STATUS_LABELS: Record<string, Record<string, string>> = {
  ar: { running: 'يعمل', stopped: 'متوقف', error: 'خطأ' },
  en: { running: 'Running', stopped: 'Stopped', error: 'Error' },
  fr: { running: 'En cours', stopped: 'Arrêté', error: 'Erreur' },
  de: { running: 'Aktiv', stopped: 'Gestoppt', error: 'Fehler' },
  es: { running: 'Activo', stopped: 'Detenido', error: 'Error' },
  tr: { running: 'Çalışıyor', stopped: 'Durdurulmuş', error: 'Hata' },
};

export function SystemInfoCards({ info, loading }: Props) {
  const { t, isRTL, locale } = useLocale();

  if (loading && !info) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/5" />
              <div className="h-3 bg-white/5 rounded w-16" />
            </div>
            <div className="h-6 bg-white/5 rounded w-20 mb-1" />
            <div className="h-2 bg-white/5 rounded-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!info) return null;

  const diskPercent = info.diskSpace.total > 0 ? Math.round((info.diskSpace.used / info.diskSpace.total) * 100) : 0;
  const memPercent = info.memory.total > 0 ? Math.round((info.memory.used / info.memory.total) * 100) : 0;

  const labels = STATUS_LABELS[locale] || STATUS_LABELS.en;

  const cards = [
    {
      label: t('dashboard.server'),
      value: info.hostname,
      sub: info.os,
      icon: Monitor,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      gradient: 'from-violet-500/20 to-transparent',
    },
    {
      label: 'CPU',
      value: `${info.cpu.usage}%`,
      sub: `${info.cpu.cores} ${t('dashboard.cores')}`,
      icon: Cpu,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      gradient: 'from-emerald-500/20 to-transparent',
      percent: info.cpu.usage,
      percentColor: '#22C55E',
    },
    {
      label: t('dashboard.memory'),
      value: `${memPercent}%`,
      sub: `${formatBytes(info.memory.used)} / ${formatBytes(info.memory.total)}`,
      icon: MemoryStick,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      gradient: 'from-blue-500/20 to-transparent',
      percent: memPercent,
      percentColor: '#3B82F6',
    },
    {
      label: t('dashboard.disk'),
      value: `${diskPercent}%`,
      sub: `${formatBytes(info.diskSpace.free)} ${t('dashboard.freeOf')} ${formatBytes(info.diskSpace.total)}`,
      icon: HardDrive,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      gradient: 'from-amber-500/20 to-transparent',
      percent: diskPercent,
      percentColor: '#F59E0B',
    },
    {
      label: 'Java',
      value: info.javaVersion || 'N/A',
      sub: null,
      icon: Activity,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      gradient: 'from-cyan-500/20 to-transparent',
    },
    {
      label: 'Oracle Forms',
      value: info.formsVersion || 'N/A',
      sub: `${t('dashboard.reports')}: ${info.reportsVersion || 'N/A'}`,
      icon: Globe,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      gradient: 'from-orange-500/20 to-transparent',
    },
    {
      label: 'WebLogic',
      value: labels[info.weblogicStatus] || info.weblogicStatus,
      sub: `${t('dashboard.nodeManager')}: ${labels[info.nodeManagerStatus] || info.nodeManagerStatus}`,
      icon: Wifi,
      color: info.weblogicStatus === 'running' ? 'text-emerald-400' : 'text-red-400',
      bg: info.weblogicStatus === 'running' ? 'bg-emerald-500/10' : 'bg-red-500/10',
      gradient: info.weblogicStatus === 'running' ? 'from-emerald-500/20 to-transparent' : 'from-red-500/20 to-transparent',
      status: info.weblogicStatus,
      subStatus: info.nodeManagerStatus,
    },
    {
      label: t('dashboard.database'),
      value: labels[info.databaseStatus] || info.databaseStatus,
      sub: `${t('dashboard.listener')}: ${labels[info.listenerStatus] || info.listenerStatus}`,
      icon: Database,
      color: info.databaseStatus === 'running' ? 'text-emerald-400' : 'text-red-400',
      bg: info.databaseStatus === 'running' ? 'bg-emerald-500/10' : 'bg-red-500/10',
      gradient: info.databaseStatus === 'running' ? 'from-emerald-500/20 to-transparent' : 'from-red-500/20 to-transparent',
      status: info.databaseStatus,
      subStatus: info.listenerStatus,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.04 * i }}
            className={cn(
              'glass-card rounded-xl p-4 stat-card-hover group relative overflow-hidden',
              card.status && `border ${card.status === 'running' ? 'border-emerald-500/20' : 'border-red-500/20'}`
            )}
          >
            {/* Gradient accent */}
            <div className={cn('absolute top-0 inset-x-0 h-px bg-gradient-to-r opacity-60', card.gradient)} />

            <div className={cn('flex items-center justify-between mb-3', isRTL && 'flex-row-reverse')}>
              <div className={cn('p-2 rounded-lg transition-colors', card.bg, 'group-hover:scale-110 transition-transform')}>
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
            </div>

            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {card.status && <StatusDot status={card.status} />}
                  <span className={cn('text-lg font-bold tracking-tight truncate', card.color)}>{card.value}</span>
                </div>
                {card.sub && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{card.sub}</p>
                )}
                {card.subStatus && (
                  <div className={cn('flex items-center gap-1 mt-1', isRTL && 'flex-row-reverse')}>
                    <StatusDot status={card.subStatus} />
                    <span className="text-[10px] text-muted-foreground">{labels[card.subStatus] || card.subStatus}</span>
                  </div>
                )}
              </div>
              {card.percent !== undefined && (
                <ProgressRing percent={card.percent} color={card.percentColor} size={44} />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

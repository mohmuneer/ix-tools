'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { ScrollText, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

const LEVEL_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

export function RecentActivity() {
  const { logs } = useAppStore();
  const { t, isRTL } = useLocale();
  const recent = logs.slice(-30).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className={cn('flex items-center justify-between px-5 py-3 border-b border-white/5', isRTL && 'flex-row-reverse')}>
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <ScrollText className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold">{t('dashboard.recentActivity')}</span>
        </div>
        {recent.length > 0 && (
          <span className="text-[10px] text-muted-foreground font-mono">{recent.length}</span>
        )}
      </div>
      <div className="p-4 max-h-[420px] overflow-y-auto">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ScrollText className="h-8 w-8 mb-2 opacity-20" />
            <span className="text-sm">{t('dashboard.noActivity')}</span>
          </div>
        ) : (
          <div className="space-y-1">
            {recent.map((log, i) => {
              const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.02 * Math.min(i, 10) }}
                  className={cn(
                    'flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <div className={cn('p-1 rounded-md shrink-0 mt-0.5', cfg.bg)}>
                    <Icon className={cn('h-3 w-3', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-start leading-relaxed">{log.message}</p>
                    <div className={cn('flex items-center gap-2 mt-0.5', isRTL && 'flex-row-reverse')}>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.source && (
                        <span className="text-[10px] text-muted-foreground/50 font-mono">{log.source}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

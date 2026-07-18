'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Rocket,
  FolderOpen,
  Settings2,
  RotateCcw,
  UserCircle2,
  Code2,
  Package,
  FileText,
  Layers,
} from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { href: '/sw-deploy', labelKey: 'nav.swDeploy', icon: Package, gradient: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/20' },
  { href: '/deployment', labelKey: 'nav.deployment', icon: Rocket, gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
  { href: '/architecture', labelKey: 'nav.architecture', icon: Layers, gradient: 'from-blue-500 to-violet-500', glow: 'shadow-blue-500/20' },
  { href: '/file-manager', labelKey: 'nav.fileManager', icon: FolderOpen, gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  { href: '/config-manager', labelKey: 'nav.configManager', icon: Settings2, gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
  { href: '/editor', labelKey: 'nav.smartEditor', icon: Code2, gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/20' },
  { href: '/profiles', labelKey: 'nav.profiles', icon: UserCircle2, gradient: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/20' },
  { href: '/templates', labelKey: 'nav.templates', icon: FileText, gradient: 'from-teal-500 to-cyan-500', glow: 'shadow-teal-500/20' },
  { href: '/rollback', labelKey: 'nav.rollback', icon: RotateCcw, gradient: 'from-red-500 to-orange-500', glow: 'shadow-red-500/20' },
];

export function QuickActions() {
  const { t, isRTL } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className={cn('flex items-center gap-2 px-5 py-3 border-b border-white/5')}>
        <Rocket className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold">{t('dashboard.quickActions')}</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.03 * i }}
              >
                <Link href={action.href}>
                  <div className={cn(
                    'group flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]',
                    'hover:bg-white/[0.05] hover:border-white/10 hover:shadow-lg',
                    action.glow,
                    'transition-all duration-200 cursor-pointer text-center'
                  )}>
                    <div className={cn(
                      'p-2.5 rounded-xl bg-gradient-to-br text-white shadow-md',
                      action.gradient,
                      'group-hover:scale-110 transition-transform duration-200'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                      {t(action.labelKey)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

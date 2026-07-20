'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useLocale } from '@/hooks/use-locale';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import {
  ARCHITECTURE_TOOLS,
  JOURNEY_STEPS,
  ARCHITECTURE_GUIDES,
  TIER_ORDER,
  TIER_COLORS,
  CONNECTIONS,
  type ArchitectureTool,
  type JourneyStep,
} from '@/lib/architecture-data';
import {
  Globe,
  Coffee,
  MonitorCheck,
  Server,
  FileSpreadsheet,
  Globe2,
  FileBarChart,
  Terminal,
  Lock,
  Database,
  X,
  BookOpen,
  ExternalLink,
  Boxes,
  Cpu,
  ArrowDown,
  ChevronRight,
  Eye,
  EyeOff,
  CircleDot,
  GitBranch,
  Workflow,
  BarChart3,
  Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArchitectureDataEditor } from '@/components/architecture/architecture-data-editor';
import { useArchitectureStore } from '@/stores/architecture-store';
import { CanEdit } from '@/components/ui/can-edit';

import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, Coffee, MonitorCheck, Server, FileSpreadsheet, Globe2,
  FileBarChart, Terminal, Lock, Database,
};

const TIER_CONFIG: Record<string, {
  labelKey: string;
  subKey: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  dotColor: string;
  borderColor: string;
  bgGlow: string;
}> = {
  client: {
    labelKey: 'arch.tier.client',
    subKey: 'arch.tier.clientSub',
    icon: Globe,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/20',
    bgGlow: 'shadow-emerald-500/10',
  },
  application: {
    labelKey: 'arch.tier.application',
    subKey: 'arch.tier.applicationSub',
    icon: Server,
    gradient: 'from-blue-500/20 to-blue-600/5',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-500/20',
    bgGlow: 'shadow-blue-500/10',
  },
  database: {
    labelKey: 'arch.tier.database',
    subKey: 'arch.tier.databaseSub',
    icon: Database,
    gradient: 'from-amber-500/20 to-amber-600/5',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-500/20',
    bgGlow: 'shadow-amber-500/10',
  },
};

const FAKE_TRAFFIC = [
  { time: '00:00', requests: 42, memory: 68, cpu: 23 },
  { time: '04:00', requests: 18, memory: 65, cpu: 15 },
  { time: '08:00', requests: 156, memory: 72, cpu: 45 },
  { time: '12:00', requests: 234, memory: 78, cpu: 62 },
  { time: '16:00', requests: 189, memory: 75, cpu: 51 },
  { time: '20:00', requests: 98, memory: 70, cpu: 32 },
  { time: 'NOW', requests: 167, memory: 74, cpu: 48 },
];

const FAKE_DB_SESSIONS = [
  { name: 'Active', value: 42, color: '#22C55E' },
  { name: 'Idle', value: 18, color: '#F59E0B' },
  { name: 'Waiting', value: 8, color: '#EF4444' },
];

interface HighlightState {
  toolIds: string[];
  tier: string | null;
}

function StatusDot({ status, size = 'sm' }: { status: 'running' | 'stopped' | 'error'; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  return (
    <span className="relative flex items-center justify-center">
      <span className={cn(
        sizeClass, 'rounded-full status-dot',
        status === 'running' ? 'bg-emerald-500 text-emerald-500' :
        status === 'stopped' ? 'bg-red-500 text-red-500' :
        'bg-amber-500 text-amber-500'
      )} />
    </span>
  );
}

export function ArchitecturePage() {
  const { t, isRTL } = useLocale();
  const { systemInfo } = useAppStore();
  const { data: archData, init: initArch } = useArchitectureStore();
  const [selectedTool, setSelectedTool] = useState<ArchitectureTool | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [journeyHighlight, setJourneyHighlight] = useState<HighlightState>({ toolIds: [], tier: null });
  const [showDetailed, setShowDetailed] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    initArch();
  }, [initArch]);

  useEffect(() => {
    if (journeyHighlight.tier || journeyHighlight.toolIds.length > 0) {
      const timer = setTimeout(() => setJourneyHighlight({ toolIds: [], tier: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [journeyHighlight]);

  const toolsByTier = useMemo(() => {
    const grouped: Record<string, ArchitectureTool[]> = { client: [], application: [], database: [] };
    archData.tools.forEach((tool) => grouped[tool.tier].push(tool));
    return grouped;
  }, [archData.tools]);

  const getServiceStatus = useCallback((key?: string): 'running' | 'stopped' | 'error' | null => {
    if (!key || !systemInfo) return null;
    return (systemInfo as unknown as Record<string, string>)[key] as 'running' | 'stopped' | 'error' | null;
  }, [systemInfo]);

  const openToolDetail = (tool: ArchitectureTool) => {
    setSelectedTool(tool);
    setDrawerOpen(true);
  };

  const handleJourneyClick = (step: JourneyStep) => {
    setJourneyHighlight({ toolIds: step.highlightToolIds, tier: step.highlightTier });
  };

  const isToolHighlighted = (toolId: string, toolTier: string) => {
    return journeyHighlight.toolIds.includes(toolId) || journeyHighlight.tier === toolTier;
  };

  return (
    <AppLayout>
      <div className="us-page-bg min-h-screen">
        <div className="space-y-6 p-6 max-w-[1400px] mx-auto">

          {/* ── Enterprise Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Boxes className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div className={cn('space-y-0.5', isRTL && 'text-end')}>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <h1 className="text-xl font-bold tracking-tight">{isRTL ? 'بنية ONYX IX المعمارية' : 'ONYX IX Enterprise Architecture'}</h1>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">v2.1.0</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'بنية نظام ERP المتكامل — معمارية ثلاثية الطبقات' : 'Integrated ERP System — Three-Tier Architecture'}
                </p>
              </div>
            </div>
            <CanEdit>
              <Button variant="ghost" size="sm" onClick={() => setEditorOpen(true)} className="gap-1.5 text-xs text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl">
                <Pencil className="h-3.5 w-3.5" />
                {isRTL ? 'تعديل' : 'Edit'}
              </Button>
            </CanEdit>
          </motion.div>

          {/* ── Architecture Flow Diagram ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={cn('flex items-center justify-between mb-4', isRTL && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <Workflow className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold">{isRTL ? 'البنية المعمارية' : 'Architecture Overview'}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailed(!showDetailed)} className="gap-1.5 text-xs">
                {showDetailed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showDetailed ? (isRTL ? 'مبسط' : 'Simple') : (isRTL ? 'تفصيلي' : 'Detailed')}
              </Button>
            </div>

            <div className="space-y-0">
              {TIER_ORDER.map((tier, tierIdx) => {
                const tc = TIER_COLORS[tier];
                const config = TIER_CONFIG[tier];
                const tools = toolsByTier[tier];
                const TierIcon = config.icon;
                const isTierHighlighted = journeyHighlight.tier === tier;

                return (
                  <div key={tier}>
                    <motion.div
                      initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * tierIdx }}
                      className={cn(
                        'glass-card rounded-2xl overflow-hidden transition-all duration-300',
                        isTierHighlighted && 'ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                      )}
                    >
                      {/* Tier Header */}
                      <div className={cn(
                        'flex items-center justify-between px-5 py-3 border-b border-white/5',
                        `bg-gradient-to-r ${config.gradient}`
                      )}>
                        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                          <div className={cn('p-2 rounded-xl', `bg-gradient-to-br ${config.gradient}`)}>
                            <TierIcon className={cn('h-4 w-4', tc.text)} />
                          </div>
                          <div>
                            <h3 className={cn('text-sm font-semibold', tc.text)}>{t(config.labelKey)}</h3>
                            <p className="text-[10px] text-muted-foreground">{t(config.subKey)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {tools.length} {isRTL ? 'مكونات' : 'components'}
                        </Badge>
                      </div>

                      {/* Tool Cards */}
                      <div className="p-4">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {tools.map((tool, toolIdx) => {
                              const IconComp = ICON_MAP[tool.icon] || Globe;
                              const status = getServiceStatus(tool.serviceKey);
                              const highlighted = isToolHighlighted(tool.id, tier);

                              return (
                                <motion.div
                                  key={tool.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.03 * toolIdx }}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => openToolDetail(tool)}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openToolDetail(tool); }}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 text-start cursor-pointer group',
                                    highlighted && 'ring-2 ring-amber-500/30 bg-amber-500/5 border-amber-500/20'
                                  )}
                                >
                                  <div className={cn(
                                    'p-2 rounded-lg transition-colors',
                                    highlighted ? 'bg-amber-500/10' : 'bg-white/5 group-hover:bg-white/8'
                                  )}>
                                    <IconComp className={cn('h-4 w-4 transition-colors', highlighted ? 'text-amber-400' : tc.text)} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn('text-sm font-medium truncate', highlighted && 'text-amber-300')}>{tool.customName || tool.name}</p>
                                    {showDetailed && (
                                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{tool.customRoleTitle || t(tool.roleTitle)}</p>
                                    )}
                                  </div>
                                  {status && (
                                    <TooltipProvider delay={300}>
                                      <TooltipUI>
                                        <TooltipTrigger>
                                          <div className="shrink-0">
                                            <StatusDot status={status} />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {status === 'running' ? t('status.running') : status === 'stopped' ? t('status.stopped') : t('status.error')}
                                        </TooltipContent>
                                      </TooltipUI>
                                    </TooltipProvider>
                                  )}
                                </motion.div>
                              );
                            })}
                        </div>
                      </div>
                    </motion.div>

                    {/* Flow Arrow */}
                    {tierIdx < TIER_ORDER.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + 0.1 * tierIdx }}
                        className="flex flex-col items-center py-1 relative"
                      >
                        <div className="w-px h-6 bg-gradient-to-b from-white/10 to-white/5" />
                        <ArrowDown className="h-4 w-4 text-amber-500/60 flow-arrow" />
                        <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] font-mono text-muted-foreground">
                             {archData.connections[tierIdx]?.protocol} — {archData.connections[tierIdx]?.port}
                          </span>
                        </div>
                        <ArrowDown className="h-4 w-4 text-amber-500/60 flow-arrow" />
                        <div className="w-px h-6 bg-gradient-to-b from-white/5 to-white/10" />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Charts Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* Traffic Chart */}
            <Card className="glass-card border-white/5 lg:col-span-2">
              <CardContent className="p-5">
                <div className={cn('flex items-center justify-between mb-4', isRTL && 'flex-row-reverse')}>
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <BarChart3 className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">{isRTL ? 'حركة الطلبات' : 'Request Traffic'}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {isRTL ? 'آخر 24 ساعة' : 'Last 24h'}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={FAKE_TRAFFIC}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#F9FAFB' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#F59E0B" strokeWidth={2} fill="url(#trafficGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* DB Sessions Pie */}
            <Card className="glass-card border-white/5">
              <CardContent className="p-5">
                <div className={cn('flex items-center justify-between mb-4', isRTL && 'flex-row-reverse')}>
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <CircleDot className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold">{isRTL ? 'جلسات قاعدة البيانات' : 'DB Sessions'}</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={FAKE_DB_SESSIONS} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                      {FAKE_DB_SESSIONS.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={cn('flex justify-center gap-4 mt-2', isRTL && 'flex-row-reverse')}>
                  {FAKE_DB_SESSIONS.map((s) => (
                    <div key={s.name} className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-[10px] text-muted-foreground">{s.name}: {s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Memory & CPU Chart ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Card className="glass-card border-white/5">
              <CardContent className="p-5">
                <div className={cn('flex items-center justify-between mb-4', isRTL && 'flex-row-reverse')}>
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <Cpu className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold">{isRTL ? 'استخدام الموارد' : 'Resource Utilization'}</span>
                  </div>
                  <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                    <div className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-muted-foreground">{isRTL ? 'المعالج' : 'CPU'}</span>
                    </div>
                    <div className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] text-muted-foreground">{isRTL ? 'الذاكرة' : 'Memory'}</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={FAKE_TRAFFIC}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="cpu" fill="#22C55E" radius={[4, 4, 0, 0]} opacity={0.8} />
                    <Bar dataKey="memory" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Request Journey ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass-card border-white/5">
              <CardContent className="p-5">
                <div className={cn('flex items-center justify-between mb-5', isRTL && 'flex-row-reverse')}>
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <GitBranch className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">{isRTL ? 'رحلة الطلب' : 'Request Journey'}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{archData.journey.length} {isRTL ? 'خطوات' : 'steps'}</Badge>
                </div>
                <div className="relative">
                  <div className={cn(
                    'absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/40 via-blue-500/40 to-amber-500/40',
                    isRTL ? 'right-4' : 'left-4'
                  )} />
                  <div className="space-y-1">
                    {archData.journey.map((step) => {
                      const isActive = journeyHighlight.toolIds.length > 0 &&
                        step.highlightToolIds.some((id) => journeyHighlight.toolIds.includes(id));

                      return (
                        <motion.button
                          key={step.id}
                          onClick={() => handleJourneyClick(step)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            'relative flex items-start gap-4 w-full p-3 rounded-xl text-start transition-all duration-200 hover:bg-white/[0.03]',
                            isActive && 'bg-amber-500/5 ring-1 ring-amber-500/20'
                          )}
                        >
                          <div className={cn(
                            'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-all duration-300',
                            isActive
                              ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30'
                              : 'bg-background border-white/10 text-muted-foreground'
                          )}>
                            <span className="text-xs font-bold">{step.id}</span>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className={cn('text-sm font-medium', isActive && 'text-amber-300')}>
                              {t(step.title)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t(step.description)}
                            </p>
                          </div>
                          <ChevronRight className={cn('h-4 w-4 text-muted-foreground/30 shrink-0 mt-2', isRTL && 'rotate-180')} />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Installation Guides ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Card className="glass-card border-white/5">
              <CardContent className="p-5">
                <div className={cn('flex items-center justify-between mb-4', isRTL && 'flex-row-reverse')}>
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">{isRTL ? 'دليل التثبيت' : 'Installation Guides'}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{archData.guides.length} {isRTL ? 'أدلة' : 'guides'}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {archData.guides.map((guide, i) => (
                    guide.href ? (
                      <motion.a
                        key={guide.id}
                        href={guide.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.03 * i }}
                        whileHover={{ y: -2 }}
                        className="block glass-card rounded-xl p-4 hover:bg-white/[0.05] transition-all group"
                      >
                        <div className={cn('flex items-start justify-between gap-2', isRTL && 'flex-row-reverse')}>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium group-hover:text-amber-300 transition-colors">{t(guide.title)}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{t(guide.description)}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-amber-500 shrink-0 mt-0.5 transition-colors" />
                        </div>
                      </motion.a>
                    ) : (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.03 * i }}
                        className="glass-card rounded-xl p-4"
                      >
                        <h3 className="text-sm font-medium">{t(guide.title)}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t(guide.description)}</p>
                      </motion.div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ── Tool Detail Drawer ── */}
      <AnimatePresence>
        {drawerOpen && selectedTool && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => { setDrawerOpen(false); setSelectedTool(null); }}
            />
            <motion.div
              initial={{ x: isRTL ? 400 : -400 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 400 : -400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'fixed top-0 bottom-0 z-50 w-full max-w-md glass-card border-white/10 shadow-2xl flex flex-col',
                isRTL ? 'right-0 border-s' : 'left-0 border-e'
              )}
            >
              <ToolDetailContent
                tool={selectedTool}
                status={getServiceStatus(selectedTool.serviceKey)}
                onClose={() => { setDrawerOpen(false); setSelectedTool(null); }}
                isRTL={isRTL}
                t={t}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Editor Dialog */}
      <CanEdit>
        <ArchitectureDataEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
      </CanEdit>
    </AppLayout>
  );
}

function ToolDetailContent({
  tool,
  status,
  onClose,
  isRTL,
  t,
}: {
  tool: ArchitectureTool;
  status: 'running' | 'stopped' | 'error' | null;
  onClose: () => void;
  isRTL: boolean;
  t: (key: string) => string;
}) {
  const { updateTool } = useArchitectureStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    customName: tool.customName || '',
    customRoleTitle: tool.customRoleTitle || '',
    customDescription: tool.customDescription || '',
    customIntegrationBenefit: tool.customIntegrationBenefit || '',
    customNotes: tool.customNotes || '',
  });

  const tc = TIER_COLORS[tool.tier];
  const IconComp = ICON_MAP[tool.icon] || Globe;

  const displayName = tool.customName || tool.name;
  const displayRole = tool.customRoleTitle || t(tool.roleTitle);
  const displayDesc = tool.customDescription || t(tool.description);
  const displayBenefit = tool.customIntegrationBenefit || t(tool.integrationBenefit);

  const handleSave = () => {
    updateTool(tool.id, {
      customName: form.customName || undefined,
      customRoleTitle: form.customRoleTitle || undefined,
      customDescription: form.customDescription || undefined,
      customIntegrationBenefit: form.customIntegrationBenefit || undefined,
      customNotes: form.customNotes || undefined,
    });
    setEditing(false);
  };

  return (
    <>
      <div className={cn('flex items-center justify-between p-4 border-b border-white/5', isRTL && 'flex-row-reverse')}>
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          <div className={cn('p-2 rounded-xl bg-gradient-to-br', TIER_CONFIG[tool.tier].gradient)}>
            <IconComp className={cn('h-5 w-5', tc.text)} />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{displayName}</h2>
            {!editing && status && (
              <div className={cn('flex items-center gap-1.5 mt-0.5', isRTL && 'flex-row-reverse')}>
                <StatusDot status={status} />
                <span className="text-[10px] text-muted-foreground">
                  {status === 'running' ? t('status.running') : status === 'stopped' ? t('status.stopped') : t('status.error')}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
          {!editing ? (
            <CanEdit>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-8 gap-1 text-amber-500 hover:text-amber-500 hover:bg-amber-500/10">
                <Pencil className="h-3.5 w-3.5" />
                <span className="text-[10px]">{isRTL ? 'تعديل' : 'Edit'}</span>
              </Button>
            </CanEdit>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="h-8 text-[10px]">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleSave} className="h-8 text-[10px] bg-[#22C55E] hover:bg-[#16A34A] text-white">
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {editing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{isRTL ? 'اسم المكون' : 'Component Name'}</Label>
              <Input value={form.customName} onChange={(e) => setForm({ ...form, customName: e.target.value })} className="mt-1 bg-white/[0.04] border-white/[0.08] text-white text-sm" placeholder={tool.name} />
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{isRTL ? 'الدور' : 'Role'}</Label>
              <Input value={form.customRoleTitle} onChange={(e) => setForm({ ...form, customRoleTitle: e.target.value })} className="mt-1 bg-white/[0.04] border-white/[0.08] text-white text-xs" placeholder={t(tool.roleTitle)} />
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{isRTL ? 'الوصف' : 'Description'}</Label>
              <textarea value={form.customDescription} onChange={(e) => setForm({ ...form, customDescription: e.target.value })} className="mt-1 w-full min-h-[80px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs p-2 outline-none resize-y" placeholder={t(tool.description)} />
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{isRTL ? 'فائدة التكامل' : 'Integration Benefit'}</Label>
              <textarea value={form.customIntegrationBenefit} onChange={(e) => setForm({ ...form, customIntegrationBenefit: e.target.value })} className="mt-1 w-full min-h-[60px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs p-2 outline-none resize-y" placeholder={t(tool.integrationBenefit)} />
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}</Label>
              <textarea value={form.customNotes} onChange={(e) => setForm({ ...form, customNotes: e.target.value })} className="mt-1 w-full min-h-[60px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs p-2 outline-none resize-y" placeholder={isRTL ? 'أضف ملاحظات أو تفاصيل إضافية...' : 'Add notes or additional details...'} />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {isRTL ? 'اترك الحقل فارغاً للإبقاء على النص الأصلي' : 'Leave empty to keep original text'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('arch.drawer.role')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayRole}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('arch.drawer.description')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayDesc}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('arch.drawer.integrationBenefit')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayBenefit}</p>
            </div>
            {tool.relatedGuideTitle && (
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('arch.drawer.relatedGuide')}</h3>
                <Badge variant="secondary" className="text-xs gap-1.5">
                  <BookOpen className="h-3 w-3" />
                  {t(tool.relatedGuideTitle)}
                </Badge>
              </div>
            )}
            {tool.customNotes && (
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{isRTL ? 'ملاحظات' : 'Notes'}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.customNotes}</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </>
  );
}

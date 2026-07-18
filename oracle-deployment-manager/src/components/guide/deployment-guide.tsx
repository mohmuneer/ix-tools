'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp,
  ExternalLink, RotateCcw, Server, Database, Globe2,
  Terminal, Settings, MonitorCheck, ArrowDown,
} from 'lucide-react';

interface PhaseDef {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  pdfHref: string;
  stepKeys: string[];
}

const PHASES: PhaseDef[] = [
  {
    id: 'linux',
    icon: Terminal,
    color: 'text-orange-400',
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/30',
    pdfHref: '/docs/OracleLinux_8.9_Install_Guide_UltimateSolutions.pdf',
    stepKeys: ['install', 'network', 'firewall', 'selinux', 'packages', 'oracleUser', 'kernel', 'limits', 'firewalld'],
  },
  {
    id: 'database',
    icon: Database,
    color: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-500/30',
    pdfHref: '/docs/Oracle21c_Install_Guide_UltimateSolutions.pdf',
    stepKeys: ['uploadMedia', 'runInstaller', 'setPassword', 'createDB', 'configureListener', 'createService', 'testConn', 'createUsers', 'importData', 'checkListener'],
  },
  {
    id: 'apex',
    icon: Globe2,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/5',
    border: 'border-cyan-500/30',
    pdfHref: '/docs/Oracle21c_Install_Guide_UltimateSolutions.pdf',
    stepKeys: ['installApex', 'configureApex', 'testApex', 'configureImages', 'backupApexConfig'],
  },
  {
    id: 'weblogic',
    icon: Server,
    color: 'text-blue-400',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/30',
    pdfHref: '/docs/AppServer_Browsers_Guide_UltimateSolutions.pdf',
    stepKeys: ['installJdk', 'installWebLogic', 'createDomain', 'configNodeManager', 'startNodeManager', 'installFormsReports', 'applyPatch', 'configureForms', 'configureReports', 'createManagedServers', 'startServers'],
  },
  {
    id: 'ords',
    icon: Globe2,
    color: 'text-teal-400',
    bg: 'bg-teal-500/5',
    border: 'border-teal-500/30',
    pdfHref: '/docs/ORDS_APEX_SSL_Guide_UltimateSolutions.pdf',
    stepKeys: ['installOrds', 'configureOrds', 'startOrds', 'sslCert', 'configureHttps', 'testOrdsAccess', 'backupOrdsConfig'],
  },
  {
    id: 'ixConfig',
    icon: Settings,
    color: 'text-purple-400',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/30',
    pdfHref: '/docs/Forms_Patch_17301874_Guide_UltimateSolutions.pdf',
    stepKeys: ['createDirs', 'copyConfigFiles', 'replaceHost', 'replaceService', 'installWebUtil', 'installJarFiles', 'configureEnv', 'copyRegistry', 'copyFontConfig', 'restartServers'],
  },
  {
    id: 'client',
    icon: MonitorCheck,
    color: 'text-green-400',
    bg: 'bg-green-500/5',
    border: 'border-green-500/30',
    pdfHref: '/docs/POS_Server_Guide_UltimateSolutions.pdf',
    stepKeys: ['installJre', 'configBrowser', 'addTrustedSite', 'disableSecurity', 'installCert', 'testForms', 'configPOS', 'testPOS', 'verifyPrinting', 'documentIPs'],
  },
];

const STORAGE_KEY = 'ix-deployment-checklist';

function loadChecked(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveChecked(checked: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
}

export function DeploymentGuide() {
  const { t, isRTL } = useLocale();
  const { addNotification } = useAppStore();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

  useEffect(() => { setChecked(loadChecked()); }, []);

  const toggleStep = useCallback((key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveChecked(next);
      return next;
    });
  }, []);

  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, []);

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    PHASES.forEach((p) => { all[p.id] = true; });
    setExpandedPhases(all);
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedPhases({});
  }, []);

  const resetChecklist = useCallback(() => {
    setChecked({});
    saveChecked({});
    addNotification({ type: 'info', title: t('guide.resetChecklist'), message: '' });
  }, [addNotification, t]);

  const totalSteps = useMemo(() => PHASES.reduce((sum, p) => sum + p.stepKeys.length, 0), []);
  const doneSteps = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-start">{t('guide.title')}</h1>
          <p className="text-muted-foreground text-start text-sm">{t('guide.subtitle')}</p>
        </div>
        <div className={cn('flex items-center gap-2 flex-wrap', isRTL && 'flex-row-reverse')}>
          <Button variant="outline" size="sm" onClick={expandAll} className="h-8">
            <ChevronDown className={cn('h-3.5 w-3.5', isRTL ? 'ms-1' : 'me-1')} /> All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="h-8">
            <ChevronUp className={cn('h-3.5 w-3.5', isRTL ? 'ms-1' : 'me-1')} /> All
          </Button>
          <Button variant="outline" size="sm" onClick={resetChecklist} className="h-8">
            <RotateCcw className={cn('h-3.5 w-3.5', isRTL ? 'ms-1' : 'me-1')} /> {t('guide.resetChecklist')}
          </Button>
        </div>
      </div>

      {/* Overall progress */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className={cn('flex items-center justify-between mb-2', isRTL && 'flex-row-reverse')}>
            <span className="text-sm font-medium">{t('guide.progress')}</span>
            <span className="text-sm text-muted-foreground">{t('guide.completedSteps', { done: doneSteps, total: totalSteps })}</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', progress === 100 ? 'bg-green-500' : 'bg-primary')}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-end">{progress}%</p>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-3">
        {PHASES.map((phase, idx) => {
          const IconComp = phase.icon;
          const isExpanded = expandedPhases[phase.id] ?? false;
          const phaseDone = phase.stepKeys.filter((k) => checked[k]).length;
          const phaseTotal = phase.stepKeys.length;
          const phaseComplete = phaseDone === phaseTotal;

          return (
            <div key={phase.id}>
              <Card className={cn('border transition-all', phase.border, phaseComplete && 'bg-green-500/5')}>
                {/* Phase header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className={cn('w-full flex items-center gap-3 p-4 text-start hover:bg-accent/30 transition-colors rounded-lg', isRTL && 'flex-row-reverse')}
                >
                  <div className={cn('p-2 rounded-lg', phase.bg)}>
                    <IconComp className={cn('h-5 w-5', phase.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                      <h3 className="text-sm font-semibold">{t(`guide.phases.${phase.id}.title`)}</h3>
                      {phaseComplete && (
                        <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/50">
                          <CheckCircle2 className="h-3 w-3 me-0.5" /> OK
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(`guide.phases.${phase.id}.description`)}</p>
                  </div>
                  <div className={cn('flex items-center gap-2 shrink-0', isRTL && 'flex-row-reverse')}>
                    <Badge variant="secondary" className="text-[10px]">{phaseDone}/{phaseTotal}</Badge>
                    <a
                      href={phase.pdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      title={t('guide.viewGuide')}
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </a>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Steps */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <Separator className="mb-3" />
                    <div className="space-y-1">
                      {phase.stepKeys.map((stepKey, stepIdx) => {
                        const fullKey = `guide.phases.${phase.id}.steps.${stepKey}`;
                        const isChecked = !!checked[stepKey];
                        return (
                          <button
                            key={stepKey}
                            onClick={() => toggleStep(stepKey)}
                            className={cn(
                              'w-full flex items-center gap-3 p-2.5 rounded-md text-start transition-colors',
                              isChecked ? 'bg-green-500/5 hover:bg-green-500/10' : 'hover:bg-accent/30',
                              isRTL && 'flex-row-reverse'
                            )}
                          >
                            <div className="shrink-0">
                              {isChecked ? (
                                <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                              ) : (
                                <Circle className="h-4.5 w-4.5 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm', isChecked && 'text-green-600 dark:text-green-400 line-through opacity-80')}>
                                <span className={cn('text-muted-foreground/60 text-xs me-2', isRTL && 'ms-2 me-0')}>{stepIdx + 1}.</span>
                                {t(fullKey)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>

              {idx < PHASES.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  Copy,
  ArrowRightLeft,
  Settings2,
  Puzzle,
  Package,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Rocket,
  Play,
  Terminal,
  ChevronRight,
  Server,
  Database,
  HardDrive,
  FolderTree,
  Search,
  AlertOctagon,
  CheckCircle,
  RefreshCw,
  FileText,
  Link2,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { IX_MKDIR_PATHS, IX_COPY_OPERATIONS, IX_SOURCE_ROOT } from '@/lib/constants';

interface StepDef {
  id: string;
  name: string;
  nameAr: string;
  icon: any;
}

const IX_STEPS: StepDef[] = [
  { id: 'check', name: 'Verify Source Files', nameAr: 'التحقق من الملفات المصدرية', icon: Search },
  { id: 'mkdir', name: 'Create Directories', nameAr: 'إنشاء المجلدات', icon: FolderTree },
  { id: 'rename', name: 'Rename Originals', nameAr: 'إعادة تسمية الأصلية', icon: Shield },
  { id: 'copy', name: 'Copy Files', nameAr: 'نسخ الملفات', icon: Copy },
  { id: 'variables', name: 'Replace Variables', nameAr: 'استبدال المتغيرات', icon: ArrowRightLeft },
  { id: 'restart', name: 'Restart Services', nameAr: 'إعادة التشغيل', icon: RotateCcw },
];

interface PathCheckResult {
  missingDirs: string[];
  missingSourceFiles: string[];
  existingDirs: string[];
  existingSourceFiles: string[];
  totalSourceFiles: number;
  totalDirs: number;
}

interface ExecuteResults {
  dirsCreated: { path: string; success: boolean; error?: string }[];
  filesCopied: { src: string; dest: string; success: boolean; error?: string }[];
  filesRenamed: { path: string; success: boolean; error?: string }[];
  variablesReplaced: { path: string; count: number; success: boolean; error?: string }[];
}

export function SwDeployWizard() {
  const { addNotification, addLog } = useAppStore();
  const { t, isRTL } = useLocale();
  const logEndRef = useRef<HTMLDivElement>(null);

  const [hostname, setHostname] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [selectedDisk, setSelectedDisk] = useState('D:');
  const [availableDrives, setAvailableDrives] = useState<{ letter: string; label: string; freeSpace: number; totalSpace: number }[]>([]);
  const [liveLogs, setLiveLogs] = useState<{ time: string; message: string; level: string }[]>([]);

  // Check state
  const [isChecking, setIsChecking] = useState(false);
  const [pathCheck, setPathCheck] = useState<PathCheckResult | null>(null);

  // Execute state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingStep, setExecutingStep] = useState<string | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [executeResults, setExecuteResults] = useState<ExecuteResults | null>(null);
  const [stepTimings, setStepTimings] = useState<{ stepId: string; durationMs: number }[]>([]);
  const [executeOutput, setExecuteOutput] = useState('');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Retry state
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryOutput, setRetryOutput] = useState('');

  const [confirmDialog, setConfirmDialog] = useState(false);

  const allSourceOk = pathCheck && pathCheck.missingSourceFiles.length === 0;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const getStepTiming = (stepId: string) => stepTimings.find((s) => s.stepId === stepId);

  useEffect(() => {
    fetch('/api/drives')
      .then((r) => r.json())
      .then((data) => {
        if (data.drivesInfo) setAvailableDrives(data.drivesInfo);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDisk) checkPaths();
  }, [selectedDisk]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveLogs, executeOutput, retryOutput]);

  const addLog_entry = (message: string, level: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLiveLogs((prev) => [...prev, { time, message, level }]);
    addLog({ level: level as any, message, source: 'IX-Install' });
  };

  const checkPaths = async () => {
    setIsChecking(true);
    setPathCheck(null);
    setExecuteResults(null);
    setStepTimings([]);
    setExecuteOutput('');
    setRetryOutput('');
    try {
      const res = await fetch('/api/sw-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkPaths', selectedDisk }),
      });
      const data = await res.json();
      setPathCheck(data);
      addLog_entry(
        isRTL
          ? `فحص المسارات: ${data.existingSourceFiles.length}/${data.totalSourceFiles} ملف موجود`
          : `Path check: ${data.existingSourceFiles.length}/${data.totalSourceFiles} source files found`,
        data.missingSourceFiles.length > 0 ? 'warning' : 'success'
      );
    } catch {
      setPathCheck(null);
    }
    setIsChecking(false);
  };

  const executeAll = async () => {
    setConfirmDialog(false);
    setIsExecuting(true);
    setCurrentStepIdx(0);
    setExecuteResults(null);
    setStepTimings([]);
    setExecuteOutput('');
    setRetryOutput('');
    setLiveLogs([]);

    addLog_entry(isRTL ? 'بدء التنفيذ الكامل' : 'Starting full execution', 'info');
    addLog_entry(`${isRTL ? 'القرص' : 'Disk'}: ${selectedDisk}`, 'info');
    addLog_entry(`${isRTL ? 'الخادم' : 'Host'}: ${hostname || '(default)'}`, 'info');
    addLog_entry(`${isRTL ? 'الخدمة' : 'Service'}: ${serviceName || '(default)'}`, 'info');

    try {
      const res = await fetch('/api/sw-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executeAll',
          selectedDisk,
          variables: { HOST: hostname, SERVICE_NAME: serviceName },
        }),
      });
      const data = await res.json();

      setExecuteOutput(data.output || '');
      setExecuteResults(data.results || null);
      setStepTimings(data.stepTimings || []);

      if (data.output) {
        const lines = data.output.split('\n').filter((l: string) => l.trim());
        for (const line of lines) {
          const level = line.includes('✓') || line.includes('SUMMARY') ? 'success'
            : line.includes('✗') ? 'error'
            : line.includes('—') ? 'warning'
            : 'info';
          addLog_entry(line, level);
        }
      }

      if (data.success) {
        addNotification({ type: 'success', title: 'Installation Complete', message: 'All operations completed successfully!' });
      } else {
        addNotification({ type: 'warning', title: 'Installation Done (with errors)', message: 'Some operations failed. Check results below.' });
      }
    } catch (err: any) {
      addLog_entry(`Error: ${err.message}`, 'error');
    }

    setCurrentStepIdx(-1);
    setIsExecuting(false);
  };

  const executeSingleStep = async (stepId: string) => {
    if (isExecuting || executingStep) return;
    setExecutingStep(stepId);
    setRetryOutput('');

    addLog_entry(isRTL ? `تنفيذ خطوة: ${stepId}` : `Executing step: ${stepId}`, 'info');

    try {
      const res = await fetch('/api/sw-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executeStep',
          stepId,
          selectedDisk,
          variables: { HOST: hostname, SERVICE_NAME: serviceName },
        }),
      });
      const data = await res.json();

      if (data.output) {
        const lines = data.output.split('\n').filter((l: string) => l.trim());
        for (const line of lines) {
          const level = line.includes('✓') ? 'success'
            : line.includes('✗') ? 'error'
            : line.includes('—') ? 'warning'
            : 'info';
          addLog_entry(line, level);
        }
      }

      // Merge step results into existing executeResults
      setExecuteResults((prev) => {
        const base: ExecuteResults = prev || { dirsCreated: [], filesCopied: [], filesRenamed: [], variablesReplaced: [] };
        return {
          dirsCreated: [...base.dirsCreated, ...(data.results?.dirsCreated || [])],
          filesCopied: [...base.filesCopied, ...(data.results?.filesCopied || [])],
          filesRenamed: [...base.filesRenamed, ...(data.results?.filesRenamed || [])],
          variablesReplaced: [...base.variablesReplaced, ...(data.results?.variablesReplaced || [])],
        };
      });

      // Merge timings
      setStepTimings((prev) => {
        const newTiming = data.stepTimings?.[0];
        if (!newTiming) return prev;
        const exists = prev.findIndex((s) => s.stepId === stepId);
        if (exists >= 0) {
          const copy = [...prev];
          copy[exists] = newTiming;
          return copy;
        }
        return [...prev, newTiming];
      });

      setExecuteOutput((prev) => prev ? `${prev}\n${data.output || ''}` : (data.output || ''));

      if (data.success) {
        addNotification({ type: 'success', title: `Step "${stepId}" done`, message: 'Completed successfully' });
      } else {
        addNotification({ type: 'warning', title: `Step "${stepId}" done`, message: 'Some operations failed' });
      }
    } catch (err: any) {
      addLog_entry(`Error: ${err.message}`, 'error');
    }

    setExecutingStep(null);
  };

  const retryFailed = async () => {
    if (!executeResults) return;

    const failedItems: { type: string; path?: string; src?: string; dest?: string }[] = [];

    executeResults.dirsCreated.filter((r) => !r.success).forEach((r) => {
      failedItems.push({ type: 'dir', path: r.path });
    });
    executeResults.filesCopied.filter((r) => !r.success).forEach((r) => {
      failedItems.push({ type: 'file', src: r.src, dest: r.dest });
    });
    executeResults.filesRenamed.filter((r) => !r.success).forEach((r) => {
      failedItems.push({ type: 'rename', path: r.path });
    });
    executeResults.variablesReplaced.filter((r) => !r.success).forEach((r) => {
      failedItems.push({ type: 'variable', path: r.path });
    });

    if (failedItems.length === 0) return;

    setIsRetrying(true);
    setRetryOutput('');
    addLog_entry(isRTL ? 'إعادة المحاولة...' : 'Retrying failed items...', 'info');

    try {
      const res = await fetch('/api/sw-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retryFailed', selectedDisk, failedItems }),
      });
      const data = await res.json();
      setRetryOutput(data.output || '');

      if (data.output) {
        const lines = data.output.split('\n').filter((l: string) => l.trim());
        for (const line of lines) {
          const level = line.includes('✓') ? 'success' : line.includes('✗') ? 'error' : 'info';
          addLog_entry(line, level);
        }
      }

      // Re-check paths after retry
      await checkPaths();
    } catch (err: any) {
      addLog_entry(`Retry error: ${err.message}`, 'error');
    }
    setIsRetrying(false);
  };

  const summary = executeResults ? {
    dirsOk: executeResults.dirsCreated.filter((r) => r.success).length,
    dirsFail: executeResults.dirsCreated.filter((r) => !r.success).length,
    renamesOk: executeResults.filesRenamed.filter((r) => r.success).length,
    renamesFail: executeResults.filesRenamed.filter((r) => !r.success).length,
    filesOk: executeResults.filesCopied.filter((r) => r.success).length,
    filesFail: executeResults.filesCopied.filter((r) => !r.success).length,
    varsOk: executeResults.variablesReplaced.filter((r) => r.success).length,
    varsFail: executeResults.variablesReplaced.filter((r) => !r.success).length,
    hasFailed: executeResults.dirsCreated.some((r) => !r.success) ||
      executeResults.filesCopied.some((r) => !r.success) ||
      executeResults.filesRenamed.some((r) => !r.success) ||
      executeResults.variablesReplaced.some((r) => !r.success),
  } : null;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={cn('flex items-center justify-between flex-wrap gap-2', isRTL && 'flex-row-reverse')}>
        <div>
          <h2 className={cn('text-lg font-semibold flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <Rocket className="h-5 w-5 text-orange-500" />
            {isRTL ? 'خطوات إعادة التركيب' : 'Reinstallation Steps'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'تحقق → أدخل البيانات → نفّذ → أعد المحاولة' : 'Verify → Configure → Execute → Retry'}
          </p>
        </div>
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <Button variant="outline" onClick={checkPaths} disabled={isChecking || isExecuting || !!executingStep}>
            {isChecking ? <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} /> : <Search className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />}
            {isRTL ? 'تحقق' : 'Check'}
          </Button>
          <Button
            onClick={() => setConfirmDialog(true)}
            disabled={isExecuting || !!executingStep}
            className={cn("bg-orange-600 hover:bg-orange-700", !allSourceOk && "ring-2 ring-red-400")}
            size="lg"
          >
            {isExecuting ? (
              <><Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} />{isRTL ? 'جاري التنفيذ...' : 'Running...'}</>
            ) : (
              <><Play className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />{isRTL ? 'تنفيذ' : 'Execute'}</>
            )}
          </Button>
        </div>
      </div>

      {/* Inputs */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className={cn('text-xs font-medium flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                <Server className="h-3.5 w-3.5 text-muted-foreground" />
                {isRTL ? 'Hostname' : 'Hostname'}
              </Label>
              <Input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="192.168.1.100" className="h-9 text-sm" disabled={isExecuting || !!executingStep} />
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'يُستخدم في tnsnames.ora' : 'For tnsnames.ora'}</p>
            </div>
            <div className="space-y-1.5">
              <Label className={cn('text-xs font-medium flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                {isRTL ? 'Service Name' : 'Service Name'}
              </Label>
              <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="ORCL" className="h-9 text-sm" disabled={isExecuting || !!executingStep} />
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'اسم خدمة Oracle' : 'Oracle DB service'}</p>
            </div>
            <div className="space-y-1.5">
              <Label className={cn('text-xs font-medium flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                {isRTL ? 'القرص' : 'Disk'}
              </Label>
              <select value={selectedDisk} onChange={(e) => setSelectedDisk(e.target.value)} disabled={isExecuting || !!executingStep}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-mono">
                {availableDrives.map((d) => (
                  <option key={d.letter} value={d.letter}>{d.letter} — {d.label} ({d.freeSpace > 0 ? `${(d.freeSpace / (1024 ** 3)).toFixed(1)} GB` : '?'})</option>
                ))}
                {availableDrives.length === 0 && <><option value="C:">C:</option><option value="D:">D:</option></>}
              </select>
              <p className="text-[10px] text-muted-foreground">{isRTL ? `التثبيت في: ${selectedDisk}\\...` : `Install to: ${selectedDisk}\\...`}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source File Check */}
      {pathCheck && (
        <Card className={cn(allSourceOk ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700')}>
          <CardHeader className="pb-3">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <CardTitle className={cn('text-sm font-medium flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                {allSourceOk ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertOctagon className="h-4 w-4 text-red-500" />}
                {isRTL ? 'فحص الملفات المصدرية' : 'Source File Verification'}
              </CardTitle>
              <span className={cn('text-xs font-medium', allSourceOk ? 'text-green-600' : 'text-red-600')}>
                {pathCheck.existingSourceFiles.length}/{pathCheck.totalSourceFiles} {isRTL ? 'موجود' : 'OK'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {allSourceOk ? (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-md p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm text-green-600">
                  {isRTL ? 'جميع الملفات المصدرية موجودة — يمكنك التنفيذ' : 'All source files found — ready to execute'}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-red-50 dark:bg-red-950/30 rounded-md p-3">
                  <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4" />
                    {isRTL ? 'ملفات مصدراً غير موجودة!' : 'Missing source files!'}
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    {isRTL ? 'بعض الملفات مفقودة — قد يفشل التنفيذ' : 'Some files are missing — execution may fail'}
                  </p>
                  <p className="text-[11px] font-mono text-red-500 mt-0.5">{IX_SOURCE_ROOT}</p>
                </div>
                <div className="bg-red-50/50 dark:bg-red-950/20 rounded-md p-2 max-h-32 overflow-y-auto space-y-0.5">
                  {pathCheck.missingSourceFiles.map((p) => (
                    <p key={p} className="text-[11px] font-mono text-red-600 break-all">{p}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Execution Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn('text-sm font-medium flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <Terminal className="h-4 w-4" />
            {isRTL ? 'خطوات التنفيذ' : 'Execution Steps'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {IX_STEPS.map((step, idx) => {
              const isExpanded = expandedStep === step.id;
              const Icon = step.icon;
              const isActive = currentStepIdx === idx;
              const isStepRunning = executingStep === step.id;
              const canRunStep = step.id !== 'check' && !isExecuting && !executingStep;
              const isDone = executeResults !== null && (
                (step.id === 'check' && (summary?.dirsOk !== undefined || summary?.filesOk !== undefined)) ||
                (step.id === 'mkdir' && summary?.dirsOk !== undefined) ||
                (step.id === 'rename' && summary?.renamesOk !== undefined) ||
                (step.id === 'copy' && summary?.filesOk !== undefined) ||
                (step.id === 'variables' && summary?.varsOk !== undefined) ||
                (step.id === 'restart' && currentStepIdx === -1 && !isExecuting)
              );
              const hasError = executeResults !== null && (
                (step.id === 'mkdir' && summary && summary.dirsFail > 0) ||
                (step.id === 'copy' && summary && summary.filesFail > 0) ||
                (step.id === 'rename' && summary && summary.renamesFail > 0) ||
                (step.id === 'variables' && summary && summary.varsFail > 0)
              );

              return (
                <div key={step.id}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-accent/50',
                      (isActive || isStepRunning) && 'bg-blue-500/5',
                      isDone && !hasError && 'bg-green-500/5',
                      hasError && 'bg-red-500/5'
                    )}
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                  >
                    <div className="shrink-0">
                      {isActive || isStepRunning ? <Loader2 className="h-4 w-4 text-blue-500 animate-spin" /> :
                       hasError ? <XCircle className="h-4 w-4 text-red-500" /> :
                       isDone ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                       <Clock className="h-4 w-4 text-muted-foreground/50" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className={cn('text-sm font-medium', isDone && !hasError && 'text-green-600', hasError && 'text-red-600')}>
                          {isRTL ? step.nameAr : step.name}
                        </span>
                      </div>
                    </div>
                    <div className={cn('flex items-center gap-2 shrink-0', isRTL && 'flex-row-reverse')}>
                      {canRunStep && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                          onClick={(e) => { e.stopPropagation(); executeSingleStep(step.id); }}
                          title={isRTL ? `تنفيذ ${step.nameAr}` : `Run ${step.name}`}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {(() => {
                        const timing = getStepTiming(step.id);
                        if (timing && isDone) {
                          return <Badge variant="secondary" className="text-[10px] font-mono tabular-nums">{formatDuration(timing.durationMs)}</Badge>;
                        }
                        return null;
                      })()}
                      <Badge variant="outline" className="text-[10px]">{idx + 1}/{IX_STEPS.length}</Badge>
                      <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 bg-muted/30">
                      <p className="text-[11px] text-muted-foreground italic">
                        {step.id === 'check' && (isRTL ? `التحقق من ${pathCheck?.totalSourceFiles || '...'} ملف في ${IX_SOURCE_ROOT}` : `Verify ${pathCheck?.totalSourceFiles || '...'} files in ${IX_SOURCE_ROOT}`)}
                        {step.id === 'mkdir' && (isRTL ? `تنفيذ mkdir_1010.bat على ${selectedDisk}:` : `Run mkdir_1010.bat on ${selectedDisk}:`)}
                        {step.id === 'rename' && (isRTL ? 'إعادة تسمية الملفات الأصلية إلى _def' : 'Rename original files to _def backup')}
                        {step.id === 'copy' && (isRTL ? `نسخ ${IX_COPY_OPERATIONS.length} ملف من المصدر إلى ${selectedDisk}:\\` : `Copy ${IX_COPY_OPERATIONS.length} files to ${selectedDisk}:\\`)}
                        {step.id === 'variables' && (isRTL ? `استبدال {{HOST}} و{{SERVICE_NAME}} في ملفات الإعدادات` : `Replace {{HOST}} and {{SERVICE_NAME}} in config files`)}
                        {step.id === 'restart' && (isRTL ? 'إعادة تشغيل خدمات Node Manager وForms وReports' : 'Restart Node Manager, Forms, Reports services')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Execution Results */}
      {summary && (
        <Card className={cn(summary.hasFailed ? 'border-orange-300 dark:border-orange-700' : 'border-green-300 dark:border-green-700')}>
          <CardHeader className="pb-3">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <CardTitle className={cn('text-sm font-medium flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                {summary.hasFailed ? <AlertTriangle className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                {isRTL ? 'نتائج التنفيذ' : 'Execution Results'}
              </CardTitle>
              {summary.hasFailed && (
                <Button variant="outline" size="sm" onClick={retryFailed} disabled={isRetrying}>
                  {isRetrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {isRTL ? 'إعادة المحاولة' : 'Retry Failed'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Summary badges */}
            <div className={cn('flex flex-wrap gap-2', isRTL && 'flex-row-reverse')}>
              <Badge variant={summary.dirsFail > 0 ? 'destructive' : 'default'} className="text-xs">
                <FolderTree className="h-3 w-3 me-1" /> {summary.dirsOk}/{summary.dirsOk + summary.dirsFail} {isRTL ? 'مجلد' : 'dirs'}
              </Badge>
              <Badge variant={summary.renamesFail > 0 ? 'destructive' : 'default'} className="text-xs">
                <Shield className="h-3 w-3 me-1" /> {summary.renamesOk}/{summary.renamesOk + summary.renamesFail} {isRTL ? 'إعادة تسمية' : 'renames'}
              </Badge>
              <Badge variant={summary.filesFail > 0 ? 'destructive' : 'default'} className="text-xs">
                <Copy className="h-3 w-3 me-1" /> {summary.filesOk}/{summary.filesOk + summary.filesFail} {isRTL ? 'ملف' : 'files'}
              </Badge>
              <Badge variant={summary.varsFail > 0 ? 'destructive' : 'default'} className="text-xs">
                <ArrowRightLeft className="h-3 w-3 me-1" /> {summary.varsOk}/{summary.varsOk + summary.varsFail} {isRTL ? 'متغيرات' : 'vars'}
              </Badge>
            </div>

            {/* Failed items detail */}
            {summary.hasFailed && (
              <div className="space-y-2">
                <p className={cn('text-xs font-medium text-red-600', isRTL && 'flex-row-reverse')}>
                  {isRTL ? 'العناصر الفاشلة:' : 'Failed items:'}
                </p>
                <div className="bg-red-50 dark:bg-red-950/30 rounded-md p-2 max-h-40 overflow-y-auto space-y-0.5">
                  {executeResults!.dirsCreated.filter((r) => !r.success).map((r) => (
                    <p key={r.path} className="text-[11px] font-mono text-red-600 break-all">✗ DIR: {r.path} — {r.error}</p>
                  ))}
                  {executeResults!.filesRenamed.filter((r) => !r.success).map((r) => (
                    <p key={r.path} className="text-[11px] font-mono text-red-600 break-all">✗ REN: {r.path} — {r.error}</p>
                  ))}
                  {executeResults!.filesCopied.filter((r) => !r.success).map((r) => (
                    <p key={r.src} className="text-[11px] font-mono text-red-600 break-all">✗ COPY: {r.src} → {r.dest} — {r.error}</p>
                  ))}
                  {executeResults!.variablesReplaced.filter((r) => !r.success).map((r) => (
                    <p key={r.path} className="text-[11px] font-mono text-red-600 break-all">✗ VAR: {r.path} — {r.error}</p>
                  ))}
                </div>
              </div>
            )}

            {!summary.hasFailed && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-md p-3">
                <p className="text-sm text-green-600 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  {isRTL ? 'تم التنفيذ بنجاح!' : 'All operations completed successfully!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Log */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
            <CardTitle className={cn('text-sm font-medium flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <Terminal className="h-4 w-4" />
              {isRTL ? 'سجل التنفيذ' : 'Execution Log'}
            </CardTitle>
            {liveLogs.length > 0 && <Badge variant="secondary" className="text-[10px]">{liveLogs.length}</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded-lg p-3 h-[300px] overflow-y-auto">
            {liveLogs.length === 0 ? (
              <p className="text-gray-500 text-xs font-mono">{isRTL ? 'جاهز...' : 'Ready...'}</p>
            ) : (
              <div className="space-y-0.5">
                {liveLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] font-mono">
                    <span className="text-gray-500 shrink-0">{log.time}</span>
                    <span className={cn(
                      log.level === 'success' && 'text-green-400',
                      log.level === 'error' && 'text-red-400',
                      log.level === 'warning' && 'text-yellow-400',
                      log.level !== 'success' && log.level !== 'error' && log.level !== 'warning' && 'text-gray-300'
                    )}>{log.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {isRTL ? 'تأكيد التنفيذ' : 'Confirm Execution'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-muted-foreground text-sm">
              {isRTL ? 'سيتم تنفيذ جميع الخطوات بالتتابع:' : 'This will execute all steps sequentially:'}
            </p>
            <div className="bg-muted rounded-md p-3 text-sm space-y-1">
              <p>{isRTL ? 'القرص' : 'Disk'}: <span className="font-mono">{selectedDisk}</span></p>
              <p>{isRTL ? 'الخادم' : 'Host'}: <span className="font-mono">{hostname || '(default)'}</span></p>
              <p>{isRTL ? 'الخدمة' : 'Service'}: <span className="font-mono">{serviceName || '(default)'}</span></p>
              <p>{isRTL ? 'المصدر' : 'Source'}: <span className="font-mono">{IX_SOURCE_ROOT}</span></p>
              <p>{isRTL ? 'مجلدات' : 'Dirs'}: <span className="font-mono">{IX_MKDIR_PATHS.length}</span> · {isRTL ? 'ملفات' : 'Files'}: <span className="font-mono">{IX_COPY_OPERATIONS.length}</span></p>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {isRTL ? 'سيتم إنشاء نسخ احتياطية تلقائية (_def).' : 'Automatic backups (_def) will be created.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={executeAll} className="bg-orange-600 hover:bg-orange-700">
              <Rocket className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
              {isRTL ? 'تنفيذ' : 'Execute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

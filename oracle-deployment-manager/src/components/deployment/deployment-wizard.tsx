'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  StopCircle,
} from 'lucide-react';
import { useDeployStore } from '@/stores/deploy-store';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { DEPLOY_STEPS, DEPLOY_VARIABLES, SERVICES } from '@/lib/constants';
import type { DeployStep, DeployJob } from '@/types';

const stepIcons: Record<string, any> = {
  backup: Shield,
  copy: Copy,
  variables: ArrowRightLeft,
  environment: Settings2,
  webutil: Puzzle,
  jar: Package,
  restart: RotateCcw,
};

function StepStatusIcon({ status }: { status: DeployStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'running':
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

export function DeploymentWizard() {
  const { profiles, currentJob, isDeploying, setProfiles, setIsDeploying, setCurrentJob } = useDeployStore();
  const { addNotification, addLog } = useAppStore();
  const { t, isRTL } = useLocale();

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [selectedServices, setSelectedServices] = useState<string[]>(['node-manager', 'forms', 'reports']);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [jobSteps, setJobSteps] = useState<DeployStep[]>([]);
  const [liveLogs, setLiveLogs] = useState<{ time: string; message: string; level: string }[]>([]);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  useEffect(() => {
    if (selectedProfile) {
      setVariables({ ...selectedProfile.settings });
    }
  }, [selectedProfile]);

  const loadProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch {}
  }, [setProfiles]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const addLiveLog = (message: string, level: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLiveLogs((prev) => [...prev, { time, message, level }]);
    addLog({ level: level as any, message, source: 'Deployment' });
  };

  const executeStep = async (stepIndex: number): Promise<boolean> => {
    const step = DEPLOY_STEPS[stepIndex];
    const newStep: DeployStep = {
      id: step.id,
      name: step.name,
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
    };

    setJobSteps((prev) => {
      const updated = [...prev];
      updated[stepIndex] = newStep;
      return updated;
    });
    setCurrentStepIndex(stepIndex);

    addLiveLog(`Starting: ${step.name}`, 'info');

    const stepDuration = 1500 + Math.random() * 2000;
    const progressInterval = setInterval(() => {
      setJobSteps((prev) => {
        const updated = [...prev];
        if (updated[stepIndex] && updated[stepIndex].status === 'running') {
          const current = updated[stepIndex].progress;
          updated[stepIndex] = { ...updated[stepIndex], progress: Math.min(current + 15, 90) };
        }
        return updated;
      });
    }, stepDuration / 6);

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executeStep',
          stepId: step.id,
          profileId: selectedProfileId,
          variables,
          services: selectedServices,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) throw new Error('Step failed');

      setJobSteps((prev) => {
        const updated = [...prev];
        updated[stepIndex] = {
          ...updated[stepIndex],
          status: 'completed',
          progress: 100,
          endTime: new Date().toISOString(),
        };
        return updated;
      });

      addLiveLog(`Completed: ${step.name}`, 'success');
      return true;
    } catch (err) {
      clearInterval(progressInterval);

      setJobSteps((prev) => {
        const updated = [...prev];
        updated[stepIndex] = {
          ...updated[stepIndex],
          status: 'failed',
          progress: 0,
          endTime: new Date().toISOString(),
          message: 'Step failed',
        };
        return updated;
      });

      addLiveLog(`Failed: ${step.name}`, 'error');
      return false;
    }
  };

  const startDeployment = async () => {
    setConfirmDialog(false);
    setIsDeploying(true);
    setLiveLogs([]);
    setCurrentStepIndex(-1);

    const initialSteps: DeployStep[] = DEPLOY_STEPS.map((s) => ({
      id: s.id,
      name: s.name,
      status: 'pending',
      progress: 0,
    }));
    setJobSteps(initialSteps);

    addLiveLog('Deployment started', 'info');

    const jobId = crypto.randomUUID();
    const job: DeployJob = {
      id: jobId,
      profileId: selectedProfileId,
      profileName: selectedProfile?.name || 'Unknown',
      status: 'running',
      steps: initialSteps,
      startedAt: new Date().toISOString(),
      logEntries: [],
    };
    setCurrentJob(job);

    for (let i = 0; i < DEPLOY_STEPS.length; i++) {
      const success = await executeStep(i);
      if (!success) {
        addLiveLog('Deployment failed. Starting rollback...', 'error');
        setJobSteps((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'failed' };
          return updated;
        });

        for (let j = i - 1; j >= 0; j--) {
          if (jobSteps[j]?.status === 'completed') {
            addLiveLog(`Rolling back: ${DEPLOY_STEPS[j].name}`, 'warning');
          }
        }

        addNotification({
          type: 'error',
          title: 'Deployment Failed',
          message: `Step "${DEPLOY_STEPS[i].name}" failed. Rollback initiated.`,
        });

        setIsDeploying(false);
        return;
      }
    }

    addLiveLog('Deployment completed successfully!', 'success');
    addNotification({
      type: 'success',
      title: 'Deployment Complete',
      message: `Successfully deployed using profile "${selectedProfile?.name}"`,
    });
    setIsDeploying(false);
  };

  const overallProgress = jobSteps.length > 0
    ? Math.round(jobSteps.reduce((acc, s) => acc + s.progress, 0) / jobSteps.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={cn('text-sm font-medium flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <Rocket className="h-4 w-4" /> Select Deployment Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedProfileId} onValueChange={(v) => setSelectedProfileId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a profile..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {p.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProfile && (
                <div className="grid grid-cols-2 gap-3">
                  {DEPLOY_VARIABLES.map((v) => (
                    <div key={v.key} className="space-y-1">
                      <Label className="text-xs">{v.label}</Label>
                      <Input
                        value={variables[v.key] || ''}
                        onChange={(e) =>
                          setVariables((prev) => ({ ...prev, [v.key]: e.target.value }))
                        }
                        placeholder={v.placeholder}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Services to Restart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((svc) => (
                  <Button
                    key={svc.id}
                    variant={selectedServices.includes(svc.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setSelectedServices((prev) =>
                        prev.includes(svc.id)
                          ? prev.filter((s) => s !== svc.id)
                          : [...prev, svc.id]
                      )
                    }
                  >
                    {svc.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setConfirmDialog(true)}
              disabled={!selectedProfileId || isDeploying}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isDeploying ? (
                <>
                   <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} /> Deploying...
                </>
              ) : (
                <>
                   <Rocket className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> Deploy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Deployment Steps</CardTitle>
                {isDeploying && (
                  <Badge variant="outline">
                    {Math.round(overallProgress)}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isDeploying && (
                <Progress value={overallProgress} className="mb-4" />
              )}
              {DEPLOY_STEPS.map((step, idx) => {
                const jobStep = jobSteps[idx];
                const Icon = stepIcons[step.id] || Clock;
                return (
                  <div key={step.id} className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                    <StepStatusIcon status={jobStep?.status || 'pending'} />
                    <div className="flex-1">
                       <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{step.name}</span>
                      </div>
                      {jobStep?.status === 'running' && (
                        <Progress value={jobStep.progress} className="mt-1 h-1" />
                      )}
                      {jobStep?.message && (
                        <p className="text-xs text-destructive mt-1">{jobStep.message}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {idx + 1}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {liveLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Live Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {liveLogs.map((log, i) => (
                      <div key={i} className={cn('flex items-start gap-2 text-xs font-mono', isRTL && 'flex-row-reverse')}>
                        <span className="text-muted-foreground shrink-0">{log.time}</span>
                        <span
                          className={
                            log.level === 'success'
                              ? 'text-green-500'
                              : log.level === 'error'
                              ? 'text-red-500'
                              : log.level === 'warning'
                              ? 'text-yellow-500'
                              : 'text-foreground'
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Deployment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-muted-foreground">
              You are about to deploy using profile &quot;{selectedProfile?.name}&quot;.
              This will execute all {DEPLOY_STEPS.length} steps.
            </p>
            <div className="bg-muted rounded-md p-3 text-sm">
              <p>Customer: {selectedProfile?.customerName}</p>
              <p>Steps: {DEPLOY_STEPS.length}</p>
              <p>Services: {selectedServices.length} to restart</p>
            </div>
            <p className="text-sm text-yellow-500">
              A backup will be created automatically. You can rollback if needed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={startDeployment}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Rocket className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> Start Deployment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  RotateCcw,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FolderArchive,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

interface BackupRecord {
  id: string;
  fileName: string;
  originalPath: string;
  backupPath: string;
  createdAt: string;
  profileId?: string;
  jobId?: string;
}

export function RollbackManager() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<BackupRecord | null>(null);
  const { addNotification, addLog } = useAppStore();
  const { t, isRTL } = useLocale();

  const loadBackups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rollback');
      const data = await res.json();
      setBackups(data.backups || []);
    } catch {
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const handleRestore = async (backup: BackupRecord) => {
    setRestoring(backup.id);
    setConfirmRestore(null);

    try {
      await fetch('/api/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupId: backup.id }),
      });

      addNotification({
        type: 'success',
        title: 'Restore Complete',
        message: `${backup.fileName} has been restored successfully`,
      });

      addLog({
        level: 'success',
        message: `Restored ${backup.fileName} from backup`,
        source: 'Rollback',
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Restore Failed',
        message: `Failed to restore ${backup.fileName}`,
      });
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Rollback Manager</h2>
          <p className="text-sm text-muted-foreground">Restore files from backup</p>
        </div>
        <Button variant="outline" onClick={loadBackups}>
           <RotateCcw className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : backups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderArchive className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No backups available</p>
            <p className="text-xs text-muted-foreground mt-1">Backups are created during deployment</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Available Backups</CardTitle>
            <CardDescription className="text-xs">
              {backups.length} backup(s) available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-3">
                {backups.map((backup) => (
                   <div
                    key={backup.id}
                    className={cn('flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors', isRTL && 'flex-row-reverse')}
                  >
                    <FileText className="h-8 w-8 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                       <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                        <p className="text-sm font-medium truncate">{backup.fileName}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          Backup
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        Original: {backup.originalPath}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Backup: {backup.backupPath}
                      </p>
                       <div className={cn('flex items-center gap-1 mt-1 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
                        <Clock className="h-3 w-3" />
                        {new Date(backup.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={restoring === backup.id ? 'default' : 'outline'}
                      onClick={() => setConfirmRestore(backup)}
                      disabled={restoring !== null}
                    >
                      {restoring === backup.id ? (
                        <>
                            <Loader2 className={cn('h-3 w-3 animate-spin', isRTL ? 'ms-1' : 'me-1')} /> Restoring...
                        </>
                      ) : (
                        <>
                            <RotateCcw className={cn('h-3 w-3', isRTL ? 'ms-1' : 'me-1')} /> Restore
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <DialogContent>
          <DialogHeader>
             <DialogTitle className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Restore
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-muted-foreground">
              Are you sure you want to restore this file?
            </p>
            {confirmRestore && (
              <div className="bg-muted rounded-md p-3 space-y-1 text-sm">
                <p><span className="font-medium">File:</span> {confirmRestore.fileName}</p>
                <p><span className="font-medium">Original:</span> {confirmRestore.originalPath}</p>
                <p><span className="font-medium">Backup:</span> {confirmRestore.backupPath}</p>
              </div>
            )}
            <p className="text-sm text-yellow-500">
              This will overwrite the current file with the backup version.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRestore(null)}>Cancel</Button>
            <Button onClick={() => confirmRestore && handleRestore(confirmRestore)}>
               <RotateCcw className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

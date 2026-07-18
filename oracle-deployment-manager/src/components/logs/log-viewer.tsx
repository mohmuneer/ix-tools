'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ScrollText,
  Search,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/types';

const levelIcons: Record<string, any> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const levelColors: Record<string, string> = {
  success: 'text-green-500 bg-green-500/10 border-green-500/20',
  error: 'text-red-500 bg-red-500/10 border-red-500/20',
  warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  info: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
};

export function LogViewer() {
  const { logs, clearLogs } = useAppStore();
  const { t, isRTL } = useLocale();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbLogs, setDbLogs] = useState<LogEntry[]>([]);

  const loadDbLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setDbLogs(data.logs || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadDbLogs();
  }, [loadDbLogs]);

  const allLogs = [...dbLogs, ...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = allLogs.filter((log) => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDownload = () => {
    const content = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}${log.details ? ` - ${log.details}` : ''}`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deploy-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    clearLogs();
  };

  const stats = {
    total: allLogs.length,
    success: allLogs.filter((l) => l.level === 'success').length,
    error: allLogs.filter((l) => l.level === 'error').length,
    warning: allLogs.filter((l) => l.level === 'warning').length,
    info: allLogs.filter((l) => l.level === 'info').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">Activity Logs</h2>
          <p className="text-sm text-muted-foreground">Complete log of all operations</p>
        </div>
         <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <Button variant="outline" size="sm" onClick={loadDbLogs}>
            <RefreshCw className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={filteredLogs.length === 0}>
            <Download className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} className="text-destructive">
            <Trash2 className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> Clear
          </Button>
        </div>
      </div>

       <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold text-green-500">{stats.success}</p>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-lg font-bold text-red-500">{stats.error}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-lg font-bold text-yellow-500">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <Info className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold text-blue-500">{stats.info}</p>
              <p className="text-xs text-muted-foreground">Info</p>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v ?? 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <ScrollText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No logs found</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log) => {
                  const Icon = levelIcons[log.level] || Info;
                  return (
                     <div key={log.id} className={cn('flex items-start gap-3 p-3 hover:bg-accent/50', isRTL && 'flex-row-reverse')}>
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${levelColors[log.level]?.split(' ')[0] || ''}`} />
                      <div className="flex-1 min-w-0">
                         <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                          <Badge variant="outline" className={`text-[10px] ${levelColors[log.level] || ''}`}>
                            {log.level}
                          </Badge>
                          {log.source && (
                            <Badge variant="secondary" className="text-[10px]">
                              {log.source}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

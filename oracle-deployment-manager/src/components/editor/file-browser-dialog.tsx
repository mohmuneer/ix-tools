'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowUp,
  HardDrive,
  Folder,
  File,
  FileText,
  FileCode,
  FileArchive,
  Settings,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';
import type { FileItem } from '@/types';

function getFileIcon(item: FileItem) {
  if (item.type === 'directory') return <Folder className="h-4 w-4 text-yellow-500 shrink-0" />;
  const ext = item.extension.toLowerCase();
  if (['.ora', '.cfg', '.env', '.properties', '.dat'].includes(ext))
    return <Settings className="h-4 w-4 text-orange-500 shrink-0" />;
  if (['.fmb', '.fmx', '.pll', '.pld', '.rdf', '.rex'].includes(ext))
    return <FileCode className="h-4 w-4 text-red-500 shrink-0" />;
  if (['.jar', '.dll', '.res'].includes(ext))
    return <FileArchive className="h-4 w-4 text-blue-500 shrink-0" />;
  if (['.txt', '.log', '.sql', '.xml', '.html', '.htm', '.css', '.js', '.json'].includes(ext))
    return <FileText className="h-4 w-4 text-green-500 shrink-0" />;
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface FileBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (path: string, name: string) => void;
}

export function FileBrowserDialog({ open, onOpenChange, onFileSelect }: FileBrowserDialogProps) {
  const { t, isRTL } = useLocale();
  const [currentPath, setCurrentPath] = useState('C:\\');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [drives, setDrives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const loadDrives = useCallback(async () => {
    try {
      const res = await fetch('/api/drives');
      const data = await res.json();
      setDrives(data.drives || ['C:']);
    } catch {
      setDrives(['C:']);
    }
  }, []);

  const loadDirectory = useCallback(async (dirPath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadDrives();
      loadDirectory(currentPath);
    }
  }, [open, loadDrives, loadDirectory, currentPath]);

  useEffect(() => {
    if (open) {
      setFilter('');
    }
  }, [open]);

  const navigateUp = () => {
    const normalized = currentPath.replace(/\//g, '\\');
    const parts = normalized.split('\\').filter(Boolean);
    if (parts.length > 1) {
      parts.pop();
      let parent = parts.join('\\');
      if (/^[A-Z]:$/i.test(parent)) parent += '\\';
      setCurrentPath(parent);
    }
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.type === 'directory') {
      setCurrentPath(item.path);
    } else {
      onFileSelect(item.path, item.name);
      onOpenChange(false);
    }
  };

  const breadcrumbParts = currentPath.replace(/\//g, '\\').split('\\').filter(Boolean);
  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumbParts.slice(0, index + 1).join('\\');
    setCurrentPath(/^[A-Z]:$/i.test(target) ? target + '\\' : target);
  };

  const filteredFiles = filter
    ? files.filter((f) => f.name.toLowerCase().includes(filter.toLowerCase()))
    : files;

  const directories = filteredFiles.filter((f) => f.type === 'directory');
  const fileItems = filteredFiles.filter((f) => f.type === 'file');
  const sorted = [...directories, ...fileItems];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          'relative bg-popover text-popover-foreground rounded-xl shadow-2xl border ring-1 ring-foreground/10',
          'w-[90vw] max-w-3xl flex flex-col overflow-hidden',
          'h-[80vh]'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between px-4 py-3 border-b shrink-0')}>
          <h2 className="text-base font-semibold">{t('editor.openFile')}</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className={cn('flex items-center gap-2 px-4 py-2 border-b shrink-0')}>
          <Button variant="outline" size="icon" onClick={navigateUp} disabled={breadcrumbParts.length <= 1} className="h-7 w-7 shrink-0">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => loadDirectory(currentPath)} className="h-7 w-7 shrink-0">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
          <div className="flex-1 flex items-center gap-0.5 bg-muted rounded px-2 py-1 min-w-0 overflow-x-auto">
            {breadcrumbParts.map((part, idx) => (
              <div key={idx} className="flex items-center shrink-0">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />}
                <button
                  onClick={() => navigateToBreadcrumb(idx)}
                  className="text-xs hover:bg-accent hover:text-accent-foreground px-1 py-0.5 rounded transition-colors whitespace-nowrap"
                >
                  {part}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Drive selector + filter */}
        <div className={cn('flex items-center gap-2 px-4 py-2 border-b shrink-0')}>
          <div className={cn('flex gap-1 shrink-0')}>
            {drives.map((drive) => (
              <Button
                key={drive}
                variant={currentPath.toUpperCase().startsWith(drive.toUpperCase()) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPath(drive + '\\')}
                className="h-6 text-[11px] px-2"
              >
                <HardDrive className="h-3 w-3 me-1" />
                {drive}
              </Button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0">
            <RefreshCw className="absolute start-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" style={{ display: 'none' }} />
            <Input
              placeholder={t('common.search') + '...'}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-6 text-xs ps-2"
            />
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {t('fileManager.noFiles')}
            </div>
          ) : (
            <div className="p-1">
              {sorted.map((item) => (
                <div
                  key={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer hover:bg-accent transition-colors group',
                    item.type === 'file' && 'opacity-80'
                  )}
                  onDoubleClick={() => handleDoubleClick(item)}
                >
                  {getFileIcon(item)}
                  <span className="flex-1 text-sm truncate">{item.name}</span>
                  {item.type === 'file' && (
                    <span className="text-xs text-muted-foreground shrink-0">{formatBytes(item.size)}</span>
                  )}
                  {item.type === 'directory' && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn('flex items-center justify-between px-4 py-2 border-t shrink-0 text-xs text-muted-foreground')}>
          <span>{sorted.length} {t('common.file')}</span>
          <Button variant="outline" size="sm" className="h-7" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

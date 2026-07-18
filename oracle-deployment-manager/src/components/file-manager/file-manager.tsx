'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFileStore } from '@/stores/file-store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowUp,
  Search,
  FolderPlus,
  FilePlus,
  Trash2,
  Copy,
  Scissors,
  Clipboard,
  RefreshCw,
  LayoutGrid,
  List,
  Folder,
  File,
  FileText,
  FileCode,
  FileArchive,
  Settings,
  HardDrive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';
import type { FileItem } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(item: FileItem) {
  if (item.type === 'directory') return <Folder className="h-5 w-5 text-yellow-500" />;
  const ext = item.extension.toLowerCase();
  if (['.ora', '.cfg', '.env', '.properties', '.dat'].includes(ext))
    return <Settings className="h-5 w-5 text-orange-500" />;
  if (['.fmb', '.fmx', '.pll', '.pld', '.rdf', '.rex'].includes(ext))
    return <FileCode className="h-5 w-5 text-red-500" />;
  if (['.jar', '.dll', '.res'].includes(ext))
    return <FileArchive className="h-5 w-5 text-blue-500" />;
  if (['.txt', '.log', '.sql', '.xml'].includes(ext))
    return <FileText className="h-5 w-5 text-green-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export function FileManager() {
  const {
    currentPath,
    files,
    selectedFiles,
    clipboardFiles,
    searchQuery,
    viewMode,
    setCurrentPath,
    setFiles,
    toggleSelectFile,
    clearSelection,
    setClipboard,
    setSearchQuery,
    setViewMode,
  } = useFileStore();
  const { t, isRTL } = useLocale();

  const [drives, setDrives] = useState<string[]>([]);
  const [drivesInfo, setDrivesInfo] = useState<{ letter: string; label: string; freeSpace: number; totalSpace: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [dialogType, setDialogType] = useState<'folder' | 'file' | 'rename' | 'delete' | null>(null);
  const [renameTarget, setRenameTarget] = useState('');

  const loadDirectory = useCallback(async (dirPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
      if (!res.ok) throw new Error('Failed to load directory');
      const data = await res.json();
      setFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setFiles]);

  const loadDrives = useCallback(async () => {
    try {
      const res = await fetch('/api/drives');
      const data = await res.json();
      setDrives(data.drives || []);
      setDrivesInfo(data.drivesInfo || []);
    } catch {
      setDrives(['C:']);
      setDrivesInfo([{ letter: 'C:', label: 'Local Disk', freeSpace: 0, totalSpace: 0 }]);
    }
  }, []);

  useEffect(() => { loadDrives(); }, [loadDrives]);
  useEffect(() => { loadDirectory(currentPath); }, [currentPath, loadDirectory]);

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
    if (item.type === 'directory') setCurrentPath(item.path);
  };

  const navigateToBreadcrumb = (index: number) => {
    const normalized = currentPath.replace(/\//g, '\\');
    const parts = normalized.split('\\').filter(Boolean);
    const target = parts.slice(0, index + 1).join('\\');
    setCurrentPath(/^[A-Z]:$/i.test(target) ? target + '\\' : target);
  };

  const handleCreateFolder = async () => {
    if (!newName) return;
    await fetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'createFolder', path: currentPath, name: newName }) });
    setNewName(''); setDialogType(null); loadDirectory(currentPath);
  };

  const handleCreateFile = async () => {
    if (!newName) return;
    await fetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'createFile', path: currentPath, name: newName }) });
    setNewName(''); setDialogType(null); loadDirectory(currentPath);
  };

  const handleDelete = async () => {
    for (const fp of selectedFiles) {
      await fetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', path: fp }) });
    }
    clearSelection(); setDialogType(null); loadDirectory(currentPath);
  };

  const handleRename = async () => {
    if (!renameTarget || !newName) return;
    await fetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'rename', path: renameTarget, name: newName }) });
    setNewName(''); setRenameTarget(''); setDialogType(null); loadDirectory(currentPath);
  };

  const handleCopy = () => { setClipboard({ action: 'copy', files: [...selectedFiles] }); clearSelection(); };
  const handleCut = () => { setClipboard({ action: 'cut', files: [...selectedFiles] }); clearSelection(); };

  const handlePaste = async () => {
    if (!clipboardFiles) return;
    for (const src of clipboardFiles.files) {
      await fetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: clipboardFiles.action === 'copy' ? 'copy' : 'move', source: src, destination: currentPath }) });
    }
    setClipboard(null); loadDirectory(currentPath);
  };

  const filteredFiles = searchQuery ? files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())) : files;
  const breadcrumbParts = currentPath.replace(/\//g, '\\').split('\\').filter(Boolean);
  const activeDrive = drives.find((d) => currentPath.toUpperCase().startsWith(d.toUpperCase())) || drives[0] || '';

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="icon" onClick={navigateUp} disabled={breadcrumbParts.length <= 1}>
          <ArrowUp className={cn('h-4 w-4', isRTL && 'rotate-[270deg]')} />
        </Button>
        <Button variant="outline" size="icon" onClick={() => loadDirectory(currentPath)}>
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Drives Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border bg-muted text-sm font-medium hover:bg-accent transition-colors shrink-0">
            <HardDrive className="h-4 w-4" />
            <span>{activeDrive || 'C:'}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
            {drivesInfo.length > 0 ? (
              drivesInfo.map((drive) => {
                const freeGB = drive.totalSpace > 0 ? (drive.freeSpace / (1024 ** 3)).toFixed(1) : '?';
                const totalGB = drive.totalSpace > 0 ? (drive.totalSpace / (1024 ** 3)).toFixed(1) : '?';
                const usagePercent = drive.totalSpace > 0 ? Math.round(((drive.totalSpace - drive.freeSpace) / drive.totalSpace) * 100) : 0;
                return (
                  <DropdownMenuItem key={drive.letter} onClick={() => setCurrentPath(drive.letter + '\\')}
                    className={cn('flex flex-col gap-1 py-2', currentPath.toUpperCase().startsWith(drive.letter.toUpperCase()) && 'bg-accent')}>
                    <div className="flex items-center gap-2 w-full">
                      <HardDrive className="h-4 w-4 shrink-0" />
                      <span className="font-medium text-sm">{drive.letter}</span>
                      <span className="text-xs text-muted-foreground truncate flex-1">{drive.label}</span>
                      {drive.totalSpace > 0 && <span className="text-[10px] text-muted-foreground shrink-0">{usagePercent}%</span>}
                    </div>
                    {drive.totalSpace > 0 && (
                      <div className="w-full ps-6">
                        <div className="text-[10px] text-muted-foreground">
                          {freeGB} {t('common.free')} / {totalGB} GB
                        </div>
                        <div className="h-1 bg-muted rounded-full mt-0.5 overflow-hidden">
                          <div className={cn('h-full rounded-full', usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${usagePercent}%` }} />
                        </div>
                      </div>
                    )}
                  </DropdownMenuItem>
                );
              })
            ) : (
              drives.map((drive) => (
                <DropdownMenuItem key={drive} onClick={() => setCurrentPath(drive + '\\')}
                  className={cn('font-mono text-sm', currentPath.toUpperCase().startsWith(drive.toUpperCase()) && 'bg-accent')}>
                  <HardDrive className="h-4 w-4 me-2" />
                  {drive}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Breadcrumb */}
        <div className="flex-1 flex items-center gap-0.5 bg-muted rounded-md px-2 py-1 min-w-0 overflow-x-auto">
          {breadcrumbParts.map((part, idx) => (
            <div key={idx} className="flex items-center shrink-0">
              {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />}
              <button onClick={() => navigateToBreadcrumb(idx)} className="text-sm hover:bg-accent hover:text-accent-foreground px-1.5 py-0.5 rounded transition-colors whitespace-nowrap">
                {part}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
          <Input placeholder={t('fileManager.searchFiles')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="ps-9" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
          {viewMode === 'list' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={() => setDialogType('folder')}>
          <FolderPlus className="h-4 w-4 me-1" /> {t('fileManager.createFolder')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialogType('file')}>
          <FilePlus className="h-4 w-4 me-1" /> {t('fileManager.createFile')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopy} disabled={selectedFiles.length === 0}>
          <Copy className="h-4 w-4 me-1" /> {t('common.copy')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCut} disabled={selectedFiles.length === 0}>
          <Scissors className="h-4 w-4 me-1" /> {t('common.cut')}
        </Button>
        <Button variant="outline" size="sm" onClick={handlePaste} disabled={!clipboardFiles}>
          <Clipboard className="h-4 w-4 me-1" /> {t('common.paste')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialogType('delete')} disabled={selectedFiles.length === 0} className="text-destructive">
          <Trash2 className="h-4 w-4 me-1" /> {t('common.delete')}
        </Button>
        {selectedFiles.length > 0 && <Badge variant="secondary">{selectedFiles.length} {t('common.selected')}</Badge>}
      </div>

      {/* File List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-destructive">{error}</div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">{searchQuery ? t('fileManager.noSearchResults') : t('fileManager.noFiles')}</div>
          ) : viewMode === 'list' ? (
            <div>
              <div className="hidden md:grid grid-cols-[1fr_120px_150px_100px] gap-2 px-4 py-2 border-b text-xs font-medium text-muted-foreground">
                <span>{t('common.name')}</span><span>{t('common.size')}</span><span>{t('common.modified')}</span><span>{t('common.type')}</span>
              </div>
              <div className="md:hidden grid grid-cols-[1fr_80px] gap-2 px-4 py-2 border-b text-xs font-medium text-muted-foreground">
                <span>{t('common.name')}</span><span>{t('common.type')}</span>
              </div>
              <ScrollArea className="h-[calc(100vh-400px)]">
                {filteredFiles.map((item) => (
                  <>
                    <div key={item.path + '-desktop'} className={cn('hidden md:grid grid-cols-[1fr_120px_150px_100px] gap-2 px-4 py-2 border-b cursor-pointer hover:bg-accent transition-colors', selectedFiles.includes(item.path) && 'bg-accent')}
                      onClick={() => toggleSelectFile(item.path)} onDoubleClick={() => handleDoubleClick(item)}>
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(item)}<span className="truncate text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground self-center">{item.type === 'directory' ? '-' : formatBytes(item.size)}</span>
                      <span className="text-sm text-muted-foreground self-center">{new Date(item.modified).toLocaleDateString()}</span>
                      <span className="text-sm text-muted-foreground self-center">{item.type === 'directory' ? t('common.folder') : (item.extension || t('common.file'))}</span>
                    </div>
                    <div key={item.path + '-mobile'} className={cn('md:hidden grid grid-cols-[1fr_80px] gap-2 px-4 py-2 border-b cursor-pointer hover:bg-accent transition-colors', selectedFiles.includes(item.path) && 'bg-accent')}
                      onClick={() => toggleSelectFile(item.path)} onDoubleClick={() => handleDoubleClick(item)}>
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(item)}<span className="truncate text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground self-center text-center">{item.type === 'directory' ? t('common.folder') : (item.extension || t('common.file'))}</span>
                    </div>
                  </>
                ))}
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)] p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredFiles.map((item) => (
                  <div key={item.path} className={cn('flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors', selectedFiles.includes(item.path) && 'bg-accent border-primary')}
                    onClick={() => toggleSelectFile(item.path)} onDoubleClick={() => handleDoubleClick(item)}>
                    {getFileIcon(item)}<span className="text-xs text-center truncate w-full">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{item.type === 'directory' ? t('common.folder') : formatBytes(item.size)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {(['folder', 'file', 'rename', 'delete'] as const).map((type) => (
        <Dialog key={type} open={dialogType === type} onOpenChange={() => setDialogType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {type === 'folder' ? t('common.createFolder') : type === 'file' ? t('common.createFile') : type === 'rename' ? t('common.rename') : t('common.delete')}
              </DialogTitle>
            </DialogHeader>
            {type !== 'delete' ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{type === 'folder' ? t('common.folderName') : type === 'file' ? t('common.fileName') : t('common.newName')}</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
                </div>
              </div>
            ) : (
              <p className="py-4 text-muted-foreground">{t('fileManager.deleteConfirm', { count: selectedFiles.length })}</p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogType(null)}>{t('common.cancel')}</Button>
              {type === 'delete' ? (
                <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
              ) : (
                <Button onClick={type === 'folder' ? handleCreateFolder : type === 'file' ? handleCreateFile : handleRename}>{t('common.confirm')}</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

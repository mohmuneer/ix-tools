'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  FileText, Save, RotateCcw, GitCompare, RefreshCw, Search,
  FolderOpen, ChevronRight, X, CheckCircle, AlertCircle, Folder, HardDrive
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SearchResult { name: string; path: string; size: number; modified: string; extension: string; }
interface BrowserEntry { name: string; path: string; type: 'file' | 'directory'; extension: string; }
interface OpenFile { name: string; path: string; content: string; originalContent: string; }

export function ConfigManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [openFile, setOpenFile] = useState<OpenFile | null>(null);
  const [editContent, setEditContent] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [sidebarTab, setSidebarTab] = useState<'search' | 'browse'>('search');
  const [browsePath, setBrowsePath] = useState('C:\\');
  const [browseEntries, setBrowseEntries] = useState<BrowserEntry[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');
  const [drives, setDrives] = useState<string[]>([]);
  const [drivesInfo, setDrivesInfo] = useState<{ letter: string; label: string; freeSpace: number; totalSpace: number }[]>([]);
  const { addNotification } = useAppStore();
  const { t, isRTL } = useLocale();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadDrives = useCallback(async () => {
    try {
      const res = await fetch('/api/drives');
      const data = await res.json();
      setDrives(data.drives || ['C:']);
      setDrivesInfo(data.drivesInfo || []);
    } catch {
      setDrives(['C:']);
      setDrivesInfo([{ letter: 'C:', label: 'Local Disk', freeSpace: 0, totalSpace: 0 }]);
    }
  }, []);

  useEffect(() => { loadDrives(); }, [loadDrives]);

  const activeDrive = drives.find((d) => browsePath.toUpperCase().startsWith(d.toUpperCase())) || drives[0] || '';

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/config?action=search&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.files || []);
    } catch {
      setSearchResults([]);
    } finally { setSearching(false); }
  }, []);

  const handleSearchDebounced = useCallback((query: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 400);
  }, [handleSearch]);

  const loadFile = useCallback(async (filePath: string, name: string) => {
    try {
      const res = await fetch(`/api/config?action=read&path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setOpenFile({ name, path: filePath, content: data.content, originalContent: data.content });
      setEditContent(data.content);
      setCompareMode(false);
    } catch {
      addNotification({ type: 'error', title: t('editor.openFailed'), message: filePath });
    }
  }, [addNotification, t]);

  const browseDir = useCallback(async (dirPath: string) => {
    setBrowseLoading(true);
    setBrowseError('');
    try {
      const res = await fetch(`/api/config?action=browse&path=${encodeURIComponent(dirPath)}`);
      const data = await res.json();
      if (data.error) { setBrowseError(data.error); setBrowseEntries([]); return; }
      setBrowsePath(dirPath);
      const entries = (data.files || []).map((f: any) => ({
        name: f.name, path: f.path, type: f.type as 'file' | 'directory', extension: f.extension || '',
      })).sort((a: BrowserEntry, b: BrowserEntry) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setBrowseEntries(entries);
    } catch {
      setBrowseError('Failed to browse directory');
      setBrowseEntries([]);
    } finally { setBrowseLoading(false); }
  }, []);

  const navigateUp = useCallback(() => {
    const parts = browsePath.replace(/\\$/, '').split('\\');
    if (parts.length > 1) {
      parts.pop();
      browseDir(parts.join('\\') || parts[0] + '\\');
    }
  }, [browsePath, browseDir]);

  const handleSave = useCallback(async () => {
    if (!openFile) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', path: openFile.path, content: editContent }),
      });
      const data = await res.json();
      if (data.success) {
        setOpenFile({ ...openFile, content: editContent, originalContent: editContent });
        setSaveStatus('saved');
        addNotification({ type: 'success', title: t('common.save'), message: `${openFile.name} saved` });
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        addNotification({ type: 'error', title: t('common.error'), message: data.error || 'Save failed' });
      }
    } catch {
      setSaveStatus('error');
      addNotification({ type: 'error', title: t('common.error'), message: 'Save failed' });
    }
  }, [openFile, editContent, addNotification, t]);

  const handleRevert = useCallback(() => {
    if (!openFile) return;
    setEditContent(openFile.originalContent);
  }, [openFile]);

  const isModified = openFile && editContent !== openFile.originalContent;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isConfigFile = (ext: string) => {
    return ['.ora', '.cfg', '.env', '.properties', '.xml', '.dat', '.pll', '.sql', '.sh', '.bat', '.ini', '.conf', '.json', '.txt', '.jar', '.res'].includes(ext);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)]">
      {/* Left panel: Search + Browse */}
      <Card className={cn('flex flex-col lg:w-[360px] shrink-0')}>
        <CardHeader className="pb-3">
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <CardTitle className="text-sm font-medium flex-1">{t('configManager.title')}</CardTitle>
            <Button variant={sidebarTab === 'search' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setSidebarTab('search')}>
              <Search className="h-3.5 w-3.5" />
            </Button>
            <Button variant={sidebarTab === 'browse' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => { setSidebarTab('browse'); if (!browseEntries.length) browseDir(browsePath); }}>
              <FolderOpen className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          {sidebarTab === 'search' ? (
            <div className="flex flex-col h-full">
              <div className="px-3 pb-3">
                <div className="relative">
                  <Search className={cn('absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground', isRTL ? 'end-3' : 'start-3')} />
                  <Input
                    placeholder={t('configManager.searchFiles')}
                    value={searchQuery}
                    onChange={(e) => handleSearchDebounced(e.target.value)}
                    className={cn('pe-9 text-start')}
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className={cn('absolute top-1/2 -translate-y-1/2', isRTL ? 'start-3' : 'end-3')}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center h-24"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : searchResults.length > 0 ? (
                  <div className="text-xs text-muted-foreground px-3 pb-1">{searchResults.length} {t('common.file').toLowerCase()}s found</div>
                ) : searchQuery && !searching ? (
                  <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                    <AlertCircle className="h-6 w-6 mb-1 opacity-50" />
                    <p className="text-xs">{t('common.noData')}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                    <Search className="h-6 w-6 mb-1 opacity-50" />
                    <p className="text-xs">{t('configManager.searchHint')}</p>
                  </div>
                )}
                {searchResults.map((file) => (
                  <div
                    key={file.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors border-b text-start',
                      openFile?.path === file.path && 'bg-accent'
                    )}
                    onClick={() => loadFile(file.path, file.name)}
                  >
                    <FileText className={cn('h-4 w-4 shrink-0', isConfigFile(file.extension) ? 'text-orange-500' : 'text-muted-foreground')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{file.path}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="px-3 pb-2 space-y-2">
                {/* Drive Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn('inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border bg-muted text-sm font-medium hover:bg-accent transition-colors w-full', isRTL && 'flex-row-reverse')}>
                    <HardDrive className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-start text-xs">{activeDrive || 'C:'}</span>
                    {drivesInfo.find(d => d.letter === activeDrive) && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {((drivesInfo.find(d => d.letter === activeDrive)?.totalSpace || 0) / (1024 ** 3)).toFixed(0)} GB
                      </span>
                    )}
                    <ChevronRight className={cn('h-3 w-3 text-muted-foreground shrink-0', isRTL && 'rotate-180')} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-full max-h-60 overflow-y-auto">
                    {drivesInfo.length > 0 ? (
                      drivesInfo.map((drive) => {
                        const freeGB = drive.totalSpace > 0 ? (drive.freeSpace / (1024 ** 3)).toFixed(1) : '?';
                        const totalGB = drive.totalSpace > 0 ? (drive.totalSpace / (1024 ** 3)).toFixed(1) : '?';
                        const usagePercent = drive.totalSpace > 0 ? Math.round(((drive.totalSpace - drive.freeSpace) / drive.totalSpace) * 100) : 0;
                        return (
                          <DropdownMenuItem key={drive.letter} onClick={() => { setBrowsePath(drive.letter + '\\'); }}
                            className={cn('flex flex-col gap-1 py-2', browsePath.toUpperCase().startsWith(drive.letter.toUpperCase()) && 'bg-accent')}>
                            <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
                              <HardDrive className="h-4 w-4 shrink-0" />
                              <span className="font-medium text-sm">{drive.letter}</span>
                              <span className="text-xs text-muted-foreground truncate flex-1">{drive.label}</span>
                              {drive.totalSpace > 0 && <span className="text-[10px] text-muted-foreground shrink-0">{usagePercent}%</span>}
                            </div>
                            {drive.totalSpace > 0 && (
                              <div className={cn('w-full', isRTL ? 'pr-6' : 'pl-6')}>
                                <div className="text-[10px] text-muted-foreground">
                                  {freeGB} free / {totalGB} GB
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
                        <DropdownMenuItem key={drive} onClick={() => { setBrowsePath(drive + '\\'); }}
                          className={cn('font-mono text-sm', browsePath.toUpperCase().startsWith(drive.toUpperCase()) && 'bg-accent')}>
                          <HardDrive className="h-4 w-4 me-2" />
                          {drive}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Breadcrumb path */}
                <div className={cn('flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1.5', isRTL && 'flex-row-reverse')}>
                  <button onClick={navigateUp} className="hover:text-foreground shrink-0" disabled={browsePath === 'C:\\' || browsePath === 'D:\\'}>
                    <ChevronRight className={cn('h-3.5 w-3.5', !isRTL && 'rotate-180')} />
                  </button>
                  <span className="truncate font-mono">{browsePath}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {browseLoading ? (
                  <div className="flex items-center justify-center h-24"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : browseError ? (
                  <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                    <AlertCircle className="h-6 w-6 mb-1 opacity-50" />
                    <p className="text-xs">{browseError}</p>
                  </div>
                ) : browseEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                    <Folder className="h-6 w-6 mb-1 opacity-50" />
                    <p className="text-xs">Empty folder</p>
                  </div>
                ) : (
                  browseEntries.map((entry) => (
                    <div
                      key={entry.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent transition-colors border-b text-start',
                        entry.type === 'file' && openFile?.path === entry.path && 'bg-accent'
                      )}
                      onClick={() => {
                        if (entry.type === 'directory') {
                          browseDir(entry.path);
                        } else if (isConfigFile(entry.extension)) {
                          loadFile(entry.path, entry.name);
                          setSidebarTab('search');
                        }
                      }}
                    >
                      {entry.type === 'directory' ? (
                        <Folder className="h-4 w-4 text-blue-500 shrink-0" />
                      ) : (
                        <FileText className={cn('h-4 w-4 shrink-0', isConfigFile(entry.extension) ? 'text-orange-500' : 'text-muted-foreground')} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{entry.name}</p>
                      </div>
                      {entry.type === 'file' && isConfigFile(entry.extension) && (
                        <Badge variant="outline" className="text-[9px] shrink-0">config</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right panel: Editor */}
      <Card className="flex flex-col flex-1 min-w-0">
        {openFile ? (
          <>
            <CardHeader className={cn('pb-3 flex flex-row items-center justify-between gap-3 flex-wrap', isRTL && 'flex-row-reverse')}>
              <div className={cn('text-start min-w-0')}>
                <CardTitle className="text-sm font-medium truncate">{openFile.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{openFile.path}</p>
              </div>
              <div className={cn('flex items-center gap-2 shrink-0', isRTL && 'flex-row-reverse')}>
                {isModified && <Badge variant="outline" className="text-orange-500">{t('configManager.modified')}</Badge>}
                {saveStatus === 'saved' && <Badge variant="outline" className="text-green-500"><CheckCircle className="h-3 w-3 me-1" /> Saved</Badge>}
                {saveStatus === 'error' && <Badge variant="outline" className="text-red-500">Error</Badge>}
                <Button variant="outline" size="sm" onClick={() => { setOpenFile(null); setCompareMode(false); }} className="h-8 px-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <div className={cn('px-4 pb-2 flex items-center gap-2 border-b', isRTL && 'flex-row-reverse')}>
              <Button variant="outline" size="sm" onClick={handleRevert} disabled={!isModified} className="h-7">
                <RotateCcw className={cn('h-3.5 w-3.5', isRTL ? 'ms-1' : 'me-1')} /> {t('configManager.revert')}
              </Button>
              <Button variant={compareMode ? 'default' : 'outline'} size="sm" onClick={() => setCompareMode(!compareMode)} className="h-7">
                <GitCompare className={cn('h-3.5 w-3.5', isRTL ? 'ms-1' : 'me-1')} /> {t('configManager.compare')}
              </Button>
              <div className="flex-1" />
              <Button size="sm" onClick={() => setSaveDialogOpen(true)} disabled={!isModified} className="h-7">
                <Save className={cn('h-3.5 w-3.5', isRTL ? 'ms-1' : 'me-1')} /> {t('common.save')}
              </Button>
            </div>
            <CardContent className="flex-1 p-0 overflow-hidden">
              {compareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="border-e">
                    <div className="px-4 py-1.5 border-b bg-muted text-xs font-medium text-start">{t('configManager.original')}</div>
                    <textarea readOnly value={openFile.originalContent} className="w-full h-[calc(100vh-340px)] resize-none bg-transparent p-4 font-mono text-sm outline-none" />
                  </div>
                  <div>
                    <div className="px-4 py-1.5 border-b bg-muted text-xs font-medium text-start">{t('configManager.current')}</div>
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full h-[calc(100vh-340px)] resize-none bg-transparent p-4 font-mono text-sm outline-none" spellCheck={false} />
                  </div>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[calc(100vh-310px)] resize-none bg-transparent p-4 font-mono text-sm outline-none"
                  spellCheck={false}
                  dir="ltr"
                />
              )}
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('configManager.selectFile')}</p>
              <p className="text-xs mt-1">{t('configManager.searchHint')}</p>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('common.save')}</DialogTitle></DialogHeader>
          <p className="py-4 text-muted-foreground">{t('configManager.saveConfirm', { file: openFile?.name || '' })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Undo2, Redo2, Search, Replace, FileText, Copy, Download, Maximize2, Minimize2, ReplaceAll, FolderOpen } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { FileBrowserDialog } from './file-browser-dialog';

interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  originalContent: string;
  modified: boolean;
  language: string;
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ora: 'plaintext', cfg: 'ini', env: 'shell', pll: 'sql', pld: 'sql',
    fmb: 'xml', rdf: 'xml', jar: 'plaintext', dll: 'plaintext', res: 'plaintext',
    xml: 'xml', properties: 'properties', dat: 'plaintext', sql: 'sql',
    bat: 'batch', sh: 'shell', txt: 'plaintext', log: 'plaintext',
    html: 'html', htm: 'html', css: 'css', js: 'javascript', json: 'json',
  };
  return map[ext] || 'plaintext';
}

export function SmartEditor() {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [lineNumbers] = useState(true);
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addNotification } = useAppStore();
  const { t, isRTL } = useLocale();
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  const handleFileOpen = () => {
    setFileBrowserOpen(true);
  };

  const handleFileSelect = async (filePath: string, fileName: string) => {
    const existingTab = tabs.find((tab) => tab.path === filePath);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}&action=read`);
      if (!res.ok) throw new Error('Failed to read file');
      const data = await res.json();
      const content = data.content || '';
      const newTab: EditorTab = {
        id: crypto.randomUUID(),
        name: fileName,
        path: filePath,
        content,
        originalContent: content,
        modified: false,
        language: detectLanguage(fileName),
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
    } catch {
      addNotification({ type: 'error', title: t('editor.openFailed'), message: fileName });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTab) return;
    setSaving(true);
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write',
          path: currentTab.path,
          content: currentTab.content,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === currentTab.id
            ? { ...tab, originalContent: tab.content, modified: false }
            : tab
        )
      );
      addNotification({
        type: 'success',
        title: t('editor.saved'),
        message: currentTab.name,
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: t('editor.saveFailed'),
        message: err.message || '',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (value: string) => {
    if (!currentTab) return;
    setUndoStack((prev) => [...prev, currentTab.content]);
    setRedoStack([]);
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === currentTab.id
          ? { ...tab, content: value, modified: tab.originalContent !== value }
          : tab
      )
    );
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !currentTab) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, currentTab.content]);
    setUndoStack((u) => u.slice(0, -1));
    handleContentChange(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !currentTab) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, currentTab.content]);
    setRedoStack((r) => r.slice(0, -1));
    handleContentChange(next);
  };

  const handleFind = () => {
    if (!currentTab || !searchText) return;
    const idx = currentTab.content.toLowerCase().indexOf(searchText.toLowerCase());
    if (idx !== -1 && textareaRef.current) {
      textareaRef.current.setSelectionRange(idx, idx + searchText.length);
      textareaRef.current.focus();
    }
  };

  const handleReplace = () => {
    if (!currentTab || !searchText) return;
    handleContentChange(currentTab.content.replace(searchText, replaceText));
  };

  const handleReplaceAll = () => {
    if (!currentTab || !searchText) return;
    handleContentChange(
      currentTab.content.replace(
        new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        replaceText
      )
    );
  };

  const handleCopyAll = () => {
    if (!currentTab) return;
    navigator.clipboard.writeText(currentTab.content);
  };

  const handleDownload = () => {
    if (!currentTab) return;
    const blob = new Blob([currentTab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentTab.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab?.modified) {
      if (!confirm(t('common.areYouSure'))) return;
    }
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTab === id) {
      const remaining = tabs.filter((t) => t.id !== id);
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const lines = currentTab ? currentTab.content.split('\n') : [];

  return (
    <div className={cn('flex flex-col', isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-[calc(100vh-180px)]')}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <Button variant="outline" size="sm" onClick={handleFileOpen} disabled={loading}>
            <FolderOpen className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} />
            {loading ? t('common.loading') : t('editor.openFile')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={!currentTab?.modified || saving}>
            <Save className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} />
            {saving ? t('common.loading') : t('editor.save')}
          </Button>
          <Button variant="outline" size="icon" onClick={handleUndo}><Undo2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={handleRedo}><Redo2 className="h-4 w-4" /></Button>
        </div>
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <Button variant="outline" size="sm" onClick={() => setSearchVisible(!searchVisible)}>
            <Search className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> {t('editor.find')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyAll} disabled={!currentTab}>
            <Copy className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> {t('editor.copyAll')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!currentTab}>
            <Download className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> {t('common.download')}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search & Replace */}
      {searchVisible && (
        <Card className="mb-2">
          <CardContent className="p-3">
            <div className={cn('flex items-center gap-2 flex-wrap', isRTL && 'flex-row-reverse')}>
              <Input placeholder={t('editor.find')} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full sm:w-48" onKeyDown={(e) => e.key === 'Enter' && handleFind()} />
              <Input placeholder={t('editor.replace')} value={replaceText} onChange={(e) => setReplaceText(e.target.value)} className="w-full sm:w-48" />
              <Button size="sm" variant="outline" onClick={handleFind}><Search className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" onClick={handleReplace}><Replace className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" onClick={handleReplaceAll}><ReplaceAll className="h-3 w-3" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className={cn('flex items-center gap-1 border-b pb-0 overflow-x-auto', isRTL && 'flex-row-reverse')}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id ? 'border-primary bg-accent' : 'border-transparent hover:bg-accent/50'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.name}</span>
              {tab.modified && <span className="w-2 h-2 rounded-full bg-orange-500" />}
              <button
                className={cn('hover:text-destructive', isRTL ? 'me-1' : 'ms-1')}
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <Card className="flex-1 mt-2">
        <CardContent className="p-0 h-full">
          {currentTab ? (
            <div className="flex h-full">
              {lineNumbers && (
                <div className={cn('bg-muted/50 text-muted-foreground text-start py-2 px-2 font-mono text-sm select-none border-e')}>
                  {lines.map((_, i) => (
                    <div key={i} className="leading-5">{i + 1}</div>
                  ))}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={currentTab.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 bg-transparent p-2 font-mono text-sm outline-none resize-none leading-5"
                spellCheck={false}
                wrap="off"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('editor.openFile')}</p>
                <Button variant="outline" className="mt-4" onClick={handleFileOpen}>
                  <FolderOpen className="h-4 w-4 me-2" /> {t('editor.openFile')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Bar */}
      {currentTab && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 px-2">
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <span>{t('editor.lines')}: {lines.length}</span>
            <span>{t('editor.characters')}: {currentTab.content.length}</span>
            <Badge variant="outline" className="text-[10px]">{currentTab.language}</Badge>
          </div>
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <span className="truncate max-w-xs" title={currentTab.path}>{currentTab.path}</span>
            {currentTab.modified && <span className="text-orange-500">{t('editor.modified')}</span>}
          </div>
        </div>
      )}

      {/* File Browser Dialog */}
      <FileBrowserDialog
        open={fileBrowserOpen}
        onOpenChange={setFileBrowserOpen}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}

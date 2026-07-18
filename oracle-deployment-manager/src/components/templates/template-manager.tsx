'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Copy,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Upload,
  Play,
  FileText,
  FileCode,
  FileArchive,
  Terminal,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Paperclip,
  FolderOpen,
  X,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { TEMPLATE_REGIONS, DEPLOY_VARIABLES } from '@/lib/constants';
import type { Template, TemplateFile } from '@/types';

function getFileIcon(ext: string) {
  switch (ext) {
    case '.bat': case '.cmd': case '.sh': case '.ps1': case '.py':
      return <Terminal className="h-4 w-4 text-purple-500 shrink-0" />;
    case '.sql':
      return <FileCode className="h-4 w-4 text-blue-500 shrink-0" />;
    case '.fmb': case '.fmx': case '.pll': case '.pld': case '.rdf':
      return <FileCode className="h-4 w-4 text-red-500 shrink-0" />;
    case '.jar': case '.dll': case '.res':
      return <FileArchive className="h-4 w-4 text-orange-500 shrink-0" />;
    case '.xml': case '.json': case '.properties':
      return <FileText className="h-4 w-4 text-green-500 shrink-0" />;
    case '.cfg': case '.ora': case '.env': case '.dat':
      return <FileText className="h-4 w-4 text-yellow-500 shrink-0" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const EXECUTABLE_EXTENSIONS = ['.bat', '.cmd', '.sh', '.ps1', '.py', '.sql', '.json', '.xml', '.cfg', '.ora', '.env', '.properties', '.txt', '.log', '.dat'];

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteFileConfirm, setDeleteFileConfirm] = useState<string | null>(null);
  const { addNotification } = useAppStore();
  const { t, isRTL } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [templateFiles, setTemplateFiles] = useState<Record<string, TemplateFile[]>>({});
  const [executingFile, setExecutingFile] = useState<string | null>(null);
  const [executionOutput, setExecutionOutput] = useState<Record<string, string>>({});
  const [showOutput, setShowOutput] = useState<string | null>(null);
  const [serverPathInput, setServerPathInput] = useState('');
  const [attachDialogTemplate, setAttachDialogTemplate] = useState<string | null>(null);
  const [serverPathDialogTemplate, setServerPathDialogTemplate] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      const loaded = data.templates || [];
      setTemplates(loaded);
      const filesMap: Record<string, TemplateFile[]> = {};
      loaded.forEach((tpl: Template) => {
        if (tpl.files && tpl.files.length > 0) {
          filesMap[tpl.id] = tpl.files;
        }
      });
      setTemplateFiles(filesMap);
    } catch {}
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const openNewDialog = () => {
    setEditingTemplate(null);
    setName('');
    setRegion('');
    setDescription('');
    setSettings({});
    setDialogOpen(true);
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setName(template.name);
    setRegion(template.region);
    setDescription(template.description);
    setSettings({ ...template.settings } as Record<string, string>);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const templateData = {
      name,
      region,
      description,
      settings,
      ...(editingTemplate ? { id: editingTemplate.id } : {}),
    };

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingTemplate ? 'update' : 'create',
          ...templateData,
        }),
      });

      addNotification({
        type: 'success',
        title: editingTemplate ? 'Template Updated' : 'Template Created',
        message: `"${name}"`,
      });

      setDialogOpen(false);
      loadTemplates();
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to save template' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
      addNotification({ type: 'success', title: 'Deleted', message: 'Template deleted' });
    } catch {}
  };

  const handleFileUpload = async (templateId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const content = await file.text();
      try {
        const res = await fetch('/api/templates/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload',
            templateId,
            name: file.name,
            content,
            extension: file.name.includes('.') ? '.' + file.name.split('.').pop() : '',
          }),
        });
        const data = await res.json();
        if (data.file) {
          setTemplateFiles((prev) => ({
            ...prev,
            [templateId]: [...(prev[templateId] || []), data.file],
          }));
          addNotification({ type: 'success', title: 'File Attached', message: file.name });
        }
      } catch {
        addNotification({ type: 'error', title: 'Upload Failed', message: file.name });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAttachFromServer = async (templateId: string) => {
    if (!serverPathInput) return;
    try {
      const res = await fetch('/api/templates/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'uploadFromServer',
          templateId,
          serverPath: serverPathInput,
        }),
      });
      const data = await res.json();
      if (data.file) {
        setTemplateFiles((prev) => ({
          ...prev,
          [templateId]: [...(prev[templateId] || []), data.file],
        }));
        addNotification({ type: 'success', title: 'File Attached', message: data.file.name });
        setServerPathInput('');
        setAttachDialogTemplate(null);
      }
    } catch {
      addNotification({ type: 'error', title: 'Attach Failed', message: serverPathInput });
    }
  };

  const handleExecuteFile = async (file: TemplateFile) => {
    if (!EXECUTABLE_EXTENSIONS.includes(file.extension)) {
      addNotification({ type: 'warning', title: 'Cannot Execute', message: `File type ${file.extension} is not executable` });
      return;
    }

    setExecutingFile(file.id);
    setExecutionOutput((prev) => ({ ...prev, [file.id]: '' }));
    setShowOutput(file.id);

    try {
      const res = await fetch('/api/templates/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', fileId: file.id }),
      });
      const data = await res.json();
      setExecutionOutput((prev) => ({ ...prev, [file.id]: data.output || 'No output' }));
      addNotification({
        type: data.success ? 'success' : 'error',
        title: data.success ? 'Execution Complete' : 'Execution Failed',
        message: `${file.name} (${data.duration}ms)`,
      });
    } catch (err: any) {
      setExecutionOutput((prev) => ({ ...prev, [file.id]: err.message || 'Execution failed' }));
      addNotification({ type: 'error', title: 'Execution Error', message: file.name });
    } finally {
      setExecutingFile(null);
    }
  };

  const handleDeleteFile = async (fileId: string, templateId: string) => {
    try {
      await fetch('/api/templates/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', fileId }),
      });
      setTemplateFiles((prev) => ({
        ...prev,
        [templateId]: (prev[templateId] || []).filter((f) => f.id !== fileId),
      }));
      setDeleteFileConfirm(null);
      addNotification({ type: 'success', title: 'File Removed', message: '' });
    } catch {}
  };

  const getRegionInfo = (regionId: string) =>
    TEMPLATE_REGIONS.find((r) => r.id === regionId);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (attachDialogTemplate) {
            handleFileUpload(attachDialogTemplate, e.target.files);
          }
        }}
      />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">{t('templates.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('templates.subtitle')}</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> {t('templates.newTemplate')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_REGIONS.map((region) => {
          const regionTemplates = templates.filter((t) => t.region === region.id);
          return (
            <Card key={region.id}>
              <CardHeader className="pb-3">
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <span className="text-2xl">{region.flag}</span>
                  <div>
                    <CardTitle className="text-sm">{region.name}</CardTitle>
                    <CardDescription className="text-xs">{region.nameAr}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {regionTemplates.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground mb-2">{t('templates.noTemplates')}</p>
                    <Button size="sm" variant="outline" onClick={openNewDialog}>
                      <Plus className={cn('h-3 w-3', isRTL ? 'ms-1' : 'me-1')} /> {t('templates.add')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {regionTemplates.map((template) => {
                      const isExpanded = expandedTemplate === template.id;
                      const files = templateFiles[template.id] || [];
                      return (
                        <div key={template.id} className="rounded-lg border overflow-hidden">
                          <div className="flex items-center justify-between p-2">
                            <div className="min-w-0 flex-1">
                              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                                <p className="text-sm font-medium truncate">{template.name}</p>
                                {files.length > 0 && (
                                  <Badge variant="secondary" className="text-[10px] shrink-0">
                                    <Paperclip className="h-2.5 w-2.5 me-0.5" /> {files.length}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                            </div>
                            <div className={cn('flex gap-0.5 shrink-0', isRTL && 'flex-row-reverse')}>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}>
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => openEditDialog(template)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"
                                onClick={() => setDeleteConfirm(template.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t bg-muted/30 p-2 space-y-2">
                              {/* File actions */}
                              <div className={cn('flex gap-1', isRTL && 'flex-row-reverse')}>
                                <Button size="sm" variant="outline" className="h-7 text-[11px]"
                                  onClick={() => {
                                    setAttachDialogTemplate(template.id);
                                    fileInputRef.current?.click();
                                  }}>
                                  <Upload className="h-3 w-3 me-1" /> {t('common.upload')}
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-[11px]"
                                  onClick={() => setServerPathDialogTemplate(template.id)}>
                                  <FolderOpen className="h-3 w-3 me-1" /> Server
                                </Button>
                              </div>

                              {/* File list */}
                              {files.length === 0 ? (
                                <p className="text-[11px] text-muted-foreground text-center py-2">
                                  {t('templates.noTemplates')}
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {files.map((file) => (
                                    <div key={file.id}>
                                      <div className={cn('flex items-center gap-2 p-1.5 rounded bg-background border', isRTL && 'flex-row-reverse')}>
                                        {getFileIcon(file.extension)}
                                        <span className="text-xs font-medium truncate flex-1">{file.name}</span>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
                                        {EXECUTABLE_EXTENSIONS.includes(file.extension) && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                            disabled={executingFile === file.id}
                                            onClick={() => handleExecuteFile(file)}
                                          >
                                            {executingFile === file.id ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Play className="h-3 w-3" />
                                            )}
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                          onClick={() => setDeleteFileConfirm(file.id)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>

                                      {/* Execution output */}
                                      {showOutput === file.id && executionOutput[file.id] && (
                                        <div className="mt-1">
                                          <div className={cn('flex items-center justify-between px-2 py-1 bg-muted rounded-t text-[10px]', isRTL && 'flex-row-reverse')}>
                                            <span className="font-mono text-muted-foreground">
                                              {executingFile === file.id ? 'Running...' : 'Output'}
                                            </span>
                                            <button onClick={() => setShowOutput(null)} className="text-muted-foreground hover:text-foreground">
                                              <X className="h-3 w-3" />
                                            </button>
                                          </div>
                                          <pre className="bg-black text-green-400 text-[11px] font-mono p-2 rounded-b max-h-48 overflow-auto whitespace-pre-wrap break-all">
                                            {executionOutput[file.id]}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template create/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? t('templates.editTemplate') : t('templates.newTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('templates.templateName')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('templates.templateName')} />
              </div>
              <div className="space-y-2">
                <Label>{t('templates.region')}</Label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">{t('templates.selectRegion')}</option>
                  {TEMPLATE_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>{r.flag} {r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('common.description')}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('common.description')} />
            </div>
            <h4 className="text-sm font-medium">{t('templates.defaultSettings')}</h4>
            <div className="grid grid-cols-2 gap-3">
              {DEPLOY_VARIABLES.map((v) => (
                <div key={v.key} className="space-y-1">
                  <Label className="text-xs">{v.label}</Label>
                  <Input
                    value={settings[v.key] || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [v.key]: e.target.value }))}
                    placeholder={v.placeholder}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} disabled={!name}>{editingTemplate ? t('common.save') : t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Server path attach dialog */}
      <Dialog open={serverPathDialogTemplate !== null} onOpenChange={(open) => { if (!open) { setServerPathDialogTemplate(null); setServerPathInput(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attach File from Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Server File Path</Label>
              <Input
                value={serverPathInput}
                onChange={(e) => setServerPathInput(e.target.value)}
                placeholder="e.g. D:\Oracle\scripts\deploy.bat"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setServerPathDialogTemplate(null); setServerPathInput(''); }}>{t('common.cancel')}</Button>
            <Button onClick={() => serverPathDialogTemplate && handleAttachFromServer(serverPathDialogTemplate)} disabled={!serverPathInput}>
              <Paperclip className="h-4 w-4 me-1" /> Attach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete template confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">{t('templates.deleteConfirm')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete file confirm */}
      <Dialog open={!!deleteFileConfirm} onOpenChange={() => setDeleteFileConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')} File</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">Remove this file from the template?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFileConfirm(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={() => {
              if (!deleteFileConfirm) return;
              for (const [tid, files] of Object.entries(templateFiles)) {
                const found = files.find((f) => f.id === deleteFileConfirm);
                if (found) {
                  handleDeleteFile(deleteFileConfirm, tid);
                  break;
                }
              }
            }}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

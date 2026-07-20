'use client';

import { useState, useRef } from 'react';
import { EditorSidebar } from '@/components/ui/editor-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
  Upload,
  FileText,
  Link2,
  ChevronDown,
} from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { useDeploymentDocsStore, type DocStep, type DocAttachment } from '@/stores/deployment-docs-store';
import { useAppStore } from '@/stores/app-store';

interface DeploymentDocsEditorProps {
  open: boolean;
  onClose: () => void;
  filterTab: 'engineer' | 'consultant';
}

export function DeploymentDocsEditor({ open, onClose, filterTab }: DeploymentDocsEditorProps) {
  const { isRTL } = useLocale();
  const { addNotification } = useAppStore();
  const {
    steps, updateStep, addStep, removeStep, addFile, removeFile, updateFile, resetDefaults,
  } = useDeploymentDocsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFileStepId, setEditingFileStepId] = useState<string | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  // Step edit form
  const [editTitle, setEditTitle] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDescAr, setEditDescAr] = useState('');

  // File edit form
  const [editFileName, setEditFileName] = useState('');
  const [editFileNameAr, setEditFileNameAr] = useState('');
  const [editFileHref, setEditFileHref] = useState('');

  // New step form
  const [newId, setNewId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDescAr, setNewDescAr] = useState('');

  // New file form
  const [newFileStepId, setNewFileStepId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileNameAr, setNewFileNameAr] = useState('');
  const [newFileHref, setNewFileHref] = useState('');

  const filteredSteps = steps.filter((d) => {
    if (d.category !== filterTab) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.titleAr.toLowerCase().includes(q) ||
      d.descriptionAr.toLowerCase().includes(q)
    );
  });

  function startEditStep(step: DocStep) {
    setEditingStepId(step.id);
    setEditTitle(step.title);
    setEditTitleAr(step.titleAr);
    setEditDesc(step.description);
    setEditDescAr(step.descriptionAr);
  }

  function saveEditStep() {
    if (!editingStepId) return;
    updateStep(editingStepId, {
      title: editTitle,
      titleAr: editTitleAr,
      description: editDesc,
      descriptionAr: editDescAr,
    });
    setEditingStepId(null);
  }

  function startEditFile(stepId: string, file: DocAttachment) {
    setEditingFileStepId(stepId);
    setEditingFileId(file.id);
    setEditFileName(file.name);
    setEditFileNameAr(file.nameAr);
    setEditFileHref(file.href);
  }

  function saveEditFile() {
    if (!editingFileStepId || !editingFileId) return;
    updateFile(editingFileStepId, editingFileId, {
      name: editFileName,
      nameAr: editFileNameAr,
      href: editFileHref,
    });
    setEditingFileStepId(null);
    setEditingFileId(null);
  }

  function handleAddStep() {
    if (!newId.trim() || !newTitle.trim()) return;
    addStep({
      id: newId.trim().toLowerCase().replace(/\s+/g, '-'),
      title: newTitle,
      titleAr: newTitleAr || newTitle,
      description: newDesc,
      descriptionAr: newDescAr || newDesc,
      category: filterTab,
      files: [],
    });
    setNewId('');
    setNewTitle('');
    setNewTitleAr('');
    setNewDesc('');
    setNewDescAr('');
    setAddMode(false);
  }

  function handleAddFile(stepId: string) {
    if (!newFileName.trim() || !newFileHref.trim()) return;
    addFile(stepId, {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newFileName,
      nameAr: newFileNameAr || newFileName,
      href: newFileHref,
    });
    setNewFileStepId(null);
    setNewFileName('');
    setNewFileNameAr('');
    setNewFileHref('');
  }

  async function handleFileUpload(stepId: string, file: File) {
    setUploadingStepId(stepId);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const newId = `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      addFile(stepId, {
        id: newId,
        name: file.name.replace(/\.[^.]+$/, ''),
        nameAr: file.name.replace(/\.[^.]+$/, ''),
        href: base64,
      });
      addNotification({ type: 'success', title: isRTL ? 'تم رفع الملف' : 'File uploaded', message: file.name });
    } catch {
      addNotification({ type: 'error', title: isRTL ? 'فشل الرفع' : 'Upload failed', message: '' });
    }
    setUploadingStepId(null);
  }

  return (
    <EditorSidebar
      open={open} onClose={onClose}
      title={isRTL ? (filterTab === 'engineer' ? 'تعديل توثيق المهندسين' : 'تعديل توثيق المحاسبين') : (filterTab === 'engineer' ? 'Edit Engineer Docs' : 'Edit Consultant Docs')}
      width="w-[520px]"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setAddMode(!addMode)} className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" /> {isRTL ? 'خطوة جديدة' : 'New Step'}
          </Button>
          <Button variant="outline" size="sm" onClick={resetDefaults} className="h-7 text-xs gap-1">
            <RotateCcw className="h-3 w-3" /> {isRTL ? 'إعادة الافتراضي' : 'Reset'}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <div className="relative direction-rtl mb-2">
          <Input placeholder={isRTL ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pe-9 text-end text-xs h-8" />
        </div>

        {filteredSteps.map((step) => {
          const isEditing = editingStepId === step.id;
          const isExpanded = expandedStepId === step.id;
          const isAddingFile = newFileStepId === step.id;

          return (
            <div key={step.id} className="border rounded-xl bg-card/50 border-border/50 overflow-hidden">
              <div className="flex items-center gap-2 p-3">
                <button onClick={() => setExpandedStepId(isExpanded ? null : step.id)} className="text-muted-foreground hover:text-foreground p-0.5">
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-2 gap-1.5">
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-7 text-xs" placeholder={isRTL ? 'العنوان' : 'Title'} />
                    <Input value={editTitleAr} onChange={(e) => setEditTitleAr(e.target.value)} className="h-7 text-xs" placeholder="العنوان بالعربي" dir="rtl" />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium">{step.titleAr}</span>
                    <Badge variant="secondary" className="text-[9px] ms-1.5">{step.files.length} {isRTL ? 'ملف' : 'files'}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isEditing ? (
                    <Button size="sm" onClick={saveEditStep} className="h-6 text-[10px]">{isRTL ? 'حفظ' : 'Save'}</Button>
                  ) : (
                    <button onClick={() => startEditStep(step)} className="text-amber-500 hover:text-amber-500/80 p-0.5"><Pencil className="h-3.5 w-3.5" /></button>
                  )}
                  <button onClick={() => removeStep(step.id)} className="text-red-500 hover:text-red-500/80 p-0.5"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-border/30 pt-2">
                  {isEditing && (
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-7 text-xs" placeholder={isRTL ? 'الوصف' : 'Description'} />
                      <Input value={editDescAr} onChange={(e) => setEditDescAr(e.target.value)} className="h-7 text-xs" placeholder="الوصف بالعربي" dir="rtl" />
                    </div>
                  )}
                  {step.files.map((file) => {
                    const isFileEditing = editingFileStepId === step.id && editingFileId === file.id;
                    return (
                      <div key={file.id} className="flex items-center gap-2 ps-4 py-1 rounded-lg hover:bg-muted/30 group">
                        {isFileEditing ? (
                          <>
                            <Input value={editFileName} onChange={(e) => setEditFileName(e.target.value)} className="h-6 text-[10px]" placeholder={isRTL ? 'الاسم' : 'Name'} />
                            <Input value={editFileNameAr} onChange={(e) => setEditFileNameAr(e.target.value)} className="h-6 text-[10px]" placeholder="الاسم بالعربي" dir="rtl" />
                            <Input value={editFileHref} onChange={(e) => setEditFileHref(e.target.value)} className="h-6 text-[10px] font-mono flex-1" placeholder="/docs/file.pdf" />
                            <Button size="sm" onClick={saveEditFile} className="h-6 text-[9px]">{isRTL ? 'حفظ' : 'Save'}</Button>
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-[11px] flex-1 min-w-0 truncate">{file.nameAr}</span>
                            <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[200px] hidden sm:inline">{file.href}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditFile(step.id, file)} className="text-amber-500 hover:text-amber-500/80 p-0"><Pencil className="h-3 w-3" /></button>
                              <button onClick={() => removeFile(step.id, file.id)} className="text-red-500 hover:text-red-500/80 p-0"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {isAddingFile ? (
                    <div className="ps-4 space-y-1.5 pt-1">
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} className="h-6 text-[10px]" placeholder={isRTL ? 'الاسم' : 'Name'} />
                        <Input value={newFileNameAr} onChange={(e) => setNewFileNameAr(e.target.value)} className="h-6 text-[10px]" placeholder="الاسم بالعربي" dir="rtl" />
                        <Input value={newFileHref} onChange={(e) => setNewFileHref(e.target.value)} className="h-6 text-[10px] font-mono" placeholder="/docs/file.pdf" />
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => handleAddFile(step.id)} className="h-6 text-[9px]">{isRTL ? 'إضافة' : 'Add'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setNewFileStepId(null)} className="h-6 text-[9px]">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="ps-4 flex items-center gap-2 pt-1">
                      <button onClick={() => setNewFileStepId(step.id)} className="text-[10px] text-amber-500 hover:text-amber-500/80 flex items-center gap-1">
                        <Plus className="h-3 w-3" /> {isRTL ? 'إضافة ملف' : 'Add file'}
                      </button>
                      <label className="text-[10px] text-blue-500 hover:text-blue-500/80 flex items-center gap-1 cursor-pointer">
                        <Upload className="h-3 w-3" /> {isRTL ? 'رفع من الجهاز' : 'Upload'}
                        <input type="file" className="hidden" accept=".pdf,.txt,.doc,.docx,.xls,.xlsx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(step.id, f); e.target.value = ''; }} />
                      </label>
                      {uploadingStepId === step.id && <Badge variant="secondary" className="text-[9px] animate-pulse">{isRTL ? 'جاري الرفع...' : 'Uploading...'}</Badge>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addMode && (
        <div className="border rounded-xl p-3 space-y-2 bg-card/50 border-amber-500/20 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <Input value={newId} onChange={(e) => setNewId(e.target.value)} className="h-7 text-xs" placeholder="step-id" />
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="h-7 text-xs" placeholder={isRTL ? 'العنوان' : 'Title'} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={newTitleAr} onChange={(e) => setNewTitleAr(e.target.value)} className="h-7 text-xs" placeholder="العنوان بالعربي" dir="rtl" />
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="h-7 text-xs" placeholder={isRTL ? 'الوصف' : 'Description'} />
          </div>
          <Input value={newDescAr} onChange={(e) => setNewDescAr(e.target.value)} className="h-7 text-xs" placeholder="الوصف بالعربي" dir="rtl" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddStep} className="h-7 text-xs">{isRTL ? 'إضافة خطوة' : 'Add Step'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddMode(false)} className="h-7 text-xs">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          </div>
        </div>
      )}
    </EditorSidebar>
  );
}

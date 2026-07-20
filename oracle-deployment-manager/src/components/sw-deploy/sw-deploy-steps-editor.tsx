'use client';

import { useState } from 'react';
import { EditorSidebar } from '@/components/ui/editor-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Pencil, Trash2, Plus, RotateCcw, ChevronDown, ChevronUp,
  Search, FolderTree, Shield, Copy, ArrowRightLeft, Type,
  RotateCcw as RestartIcon, Zap,
} from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { useSwDeployStore, type SwStep } from '@/stores/sw-deploy-store';

const ICON_MAP: Record<string, any> = {
  Search, FolderTree, Shield, Copy, ArrowRightLeft, Type, RotateCcw: RestartIcon, Zap,
};

const ICON_OPTIONS = [
  { value: 'Search', label: '\uD83D\uDD0D', labelAr: 'بحث' },
  { value: 'FolderTree', label: '\uD83D\uDCC1', labelAr: 'مجلدات' },
  { value: 'Shield', label: '\uD83D\uDEE1\uFE0F', labelAr: 'حماية' },
  { value: 'Copy', label: '\uD83D\uDCCB', labelAr: 'نسخ' },
  { value: 'ArrowRightLeft', label: '\u2194\uFE0F', labelAr: 'استبدال' },
  { value: 'Type', label: '\uD83D\uDD24', labelAr: 'خط' },
  { value: 'RotateCcw', label: '\uD83D\uDD04', labelAr: 'إعادة تشغيل' },
  { value: 'Zap', label: '\u26A1', labelAr: 'سريع' },
];

interface SwDeployStepsEditorProps {
  open: boolean;
  onClose: () => void;
}

export function SwDeployStepsEditor({ open, onClose }: SwDeployStepsEditorProps) {
  const { isRTL } = useLocale();
  const { steps, updateStep, addStep, removeStep, reorderSteps, resetDefaults, toggleStep } = useSwDeployStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [editIcon, setEditIcon] = useState('Zap');

  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  const [newIcon, setNewIcon] = useState('Zap');

  function startEdit(step: SwStep) {
    setEditingId(step.id);
    setEditName(step.name);
    setEditNameAr(step.nameAr);
    setEditDesc(step.description);
    setEditDescAr(step.descriptionAr);
    setEditIcon(step.icon);
  }

  function saveEdit() {
    if (!editingId) return;
    updateStep(editingId, { name: editName, nameAr: editNameAr, description: editDesc, descriptionAr: editDescAr, icon: editIcon });
    setEditingId(null);
  }

  function handleAdd() {
    if (!newId.trim() || !newName.trim()) return;
    addStep({ id: newId.trim().toLowerCase().replace(/\s+/g, '_'), name: newName, nameAr: newNameAr || newName, icon: newIcon, description: newDesc, descriptionAr: newDescAr || newDesc, enabled: true });
    setNewId(''); setNewName(''); setNewNameAr(''); setNewDesc(''); setNewDescAr(''); setNewIcon('Zap'); setAddOpen(false);
  }

  function moveStep(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    const arr = [...steps];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    reorderSteps(arr);
  }

  function getIcon(iconName: string) { return ICON_MAP[iconName] || Zap; }

  return (
    <EditorSidebar
      open={open} onClose={onClose}
      title={isRTL ? 'تعديل خطوات التركيب' : 'Edit Installation Steps'}
      width="w-[520px]"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(!addOpen)} className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" /> {isRTL ? 'خطوة جديدة' : 'New Step'}
          </Button>
          <Button variant="outline" size="sm" onClick={resetDefaults} className="h-7 text-xs gap-1">
            <RotateCcw className="h-3 w-3" /> {isRTL ? 'إعادة الافتراضي' : 'Reset'}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const Icon = getIcon(step.icon);
          const isEditing = editingId === step.id;
          const isExpanded = expandedId === step.id;
          return (
            <div key={step.id} className={`border rounded-xl p-3 transition-all ${step.enabled ? 'bg-card/50 border-border/50' : 'bg-muted/20 border-border/30 opacity-50'}`}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0"><ChevronUp className="h-3 w-3" /></button>
                  <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0"><ChevronDown className="h-3 w-3" /></button>
                </div>
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-xs" placeholder={isRTL ? 'الاسم' : 'Name'} />
                      <Input value={editNameAr} onChange={(e) => setEditNameAr(e.target.value)} className="h-7 text-xs" placeholder="الاسم بالعربي" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${!step.enabled ? 'line-through' : ''}`}>{isRTL ? step.nameAr : step.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">[{step.id}]</span>
                    </div>
                  )}
                </div>
                <button onClick={() => toggleStep(step.id)} className={`text-[10px] px-1.5 py-0.5 rounded-lg border transition-colors ${step.enabled ? 'border-green-500/30 text-green-500 bg-green-500/10 hover:bg-green-500/20' : 'border-red-500/30 text-red-500 bg-red-500/10 hover:bg-red-500/20'}`}>
                  {isRTL ? (step.enabled ? 'مفعّل' : 'معطّل') : (step.enabled ? 'ON' : 'OFF')}
                </button>
                <button onClick={() => setExpandedId(expandedId === step.id ? null : step.id)} className="text-muted-foreground hover:text-foreground p-0.5">
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => (isEditing ? saveEdit() : startEdit(step))} className="text-amber-500 hover:text-amber-500/80 p-0.5"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeStep(step.id)} className="text-red-500 hover:text-red-500/80 p-0.5"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              {isExpanded && (
                <div className="mt-2 ps-7 space-y-2">
                  {isEditing ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Icon</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {ICON_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => setEditIcon(opt.value)} className={`text-sm px-1.5 py-0.5 rounded-lg border transition-colors ${editIcon === opt.value ? 'border-amber-500 bg-amber-500/10' : 'border-border/50 hover:bg-muted/50'}`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">{isRTL ? 'الوصف بالإنجليزي' : 'Description'}</label>
                        <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-7 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">{isRTL ? 'الوصف بالعربي' : 'Arabic Description'}</label>
                        <Input value={editDescAr} onChange={(e) => setEditDescAr(e.target.value)} className="h-7 text-xs" dir="rtl" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{step.icon}</Badge>
                      <span className="text-[10px] text-muted-foreground">{isRTL ? step.descriptionAr : step.description}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addOpen && (
        <div className="border rounded-xl p-3 space-y-2 bg-card/50 border-amber-500/20 mt-3">
          <div className="flex items-center gap-2">
            <Input value={newId} onChange={(e) => setNewId(e.target.value)} className="h-7 text-xs" placeholder="step_id" />
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-7 text-xs" placeholder={isRTL ? 'الاسم' : 'Name'} />
            <Input value={newNameAr} onChange={(e) => setNewNameAr(e.target.value)} className="h-7 text-xs" placeholder="الاسم بالعربي" dir="rtl" />
          </div>
          <div className="flex items-center gap-2">
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="h-7 text-xs" placeholder={isRTL ? 'الوصف' : 'Description'} />
            <Input value={newDescAr} onChange={(e) => setNewDescAr(e.target.value)} className="h-7 text-xs" placeholder="الوصف بالعربي" dir="rtl" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">{isRTL ? 'الأيقونة:' : 'Icon:'}</span>
            {ICON_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setNewIcon(opt.value)} className={`text-sm px-1.5 py-0.5 rounded-lg border transition-colors ${newIcon === opt.value ? 'border-amber-500 bg-amber-500/10' : 'border-border/50 hover:bg-muted/50'}`}>{opt.label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="h-7 text-xs">{isRTL ? 'إضافة' : 'Add'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)} className="h-7 text-xs">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          </div>
        </div>
      )}
    </EditorSidebar>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { EditorSidebar } from '@/components/ui/editor-sidebar';
import {
  Plus,
  Trash2,
  Pencil,
  Server,
  Database,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Globe,
  Shield,
  Download,
} from 'lucide-react';
import type { DashboardSection, HwItem, SwItem, RequirementCategory } from '@/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Database,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Globe,
  Shield,
  Download,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const COLOR_PRESETS = [
  '#38BDF8', '#18B13A', '#FF9800', '#EF4444', '#A855F7',
  '#EC4899', '#14B8A6', '#F59E0B', '#6366F1', '#84CC16',
];

const HW_ICON_OPTIONS = ['Cpu', 'MemoryStick', 'HardDrive', 'Wifi', 'Globe', 'Shield', 'Download', 'Server', 'Database'];

function genId() {
  return crypto.randomUUID().slice(0, 8);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DashboardDataEditor({ open, onClose }: Props) {
  const { data, setSections, addSection, removeSection, setRequirements, addRequirement, removeRequirement, setPageTitles, resetToDefaults } = useDashboardStore();
  const { isRTL } = useLocale();
  const [activeTab, setActiveTab] = useState<'titles' | 'sections' | 'requirements'>('titles');
  const [editingSection, setEditingSection] = useState<DashboardSection | null>(null);
  const [editingReqIdx, setEditingReqIdx] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedReqs, setExpandedReqs] = useState<Set<number>>(new Set());
  const [titlesForm, setTitlesForm] = useState({ ...data.pageTitles });

  const toggleExpandSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleExpandReq = (idx: number) => {
    setExpandedReqs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleSaveSection = useCallback((section: DashboardSection) => {
    const idx = data.sections.findIndex((s) => s.id === section.id);
    if (idx >= 0) {
      const updated = [...data.sections];
      updated[idx] = section;
      setSections(updated);
    } else {
      addSection(section);
    }
    setEditingSection(null);
  }, [data.sections, setSections, addSection]);

  const handleDeleteSection = useCallback((id: string) => {
    removeSection(id);
  }, [removeSection]);

  const handleSaveReq = useCallback((req: RequirementCategory, idx: number) => {
    if (idx >= 0 && idx < data.requirements.length) {
      const updated = [...data.requirements];
      updated[idx] = req;
      setRequirements(updated);
    } else {
      addRequirement(req);
    }
    setEditingReqIdx(null);
  }, [data.requirements, setRequirements, addRequirement]);

  const handleDeleteReq = useCallback((idx: number) => {
    removeRequirement(idx);
  }, [removeRequirement]);

  const handleReset = () => {
    resetToDefaults();
    setExpandedSections(new Set());
    setExpandedReqs(new Set());
  };

  const handleSaveTitles = () => {
    setPageTitles(titlesForm);
  };

  return (
    <EditorSidebar
      open={open} onClose={onClose}
      title={isRTL ? 'تعديل بيانات لوحة التحكم' : 'Edit Dashboard Data'}
      width="w-[520px]"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-[#FF9800] hover:text-[#FF9800]">
            <RotateCcw className="h-3.5 w-3.5 me-1" /> {isRTL ? 'إعادة التعيين' : 'Reset'}
          </Button>
        </>
      }
    >

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 p-1 rounded-xl bg-white/[0.04]">
          <button
            onClick={() => setActiveTab('titles')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors',
              activeTab === 'titles'
                ? 'bg-[#22C55E]/10 text-[#22C55E]'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {isRTL ? 'عناوين الصفحة' : 'Page Titles'}
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors',
              activeTab === 'sections'
                ? 'bg-[#38BDF8]/10 text-[#38BDF8]'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {isRTL ? 'أقسام الخوادم' : 'Server Sections'}
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors',
              activeTab === 'requirements'
                ? 'bg-[#FF9800]/10 text-[#FF9800]'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {isRTL ? 'متطلبات التثبيت' : 'Installation Requirements'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          {activeTab === 'titles' && (
            <div className="space-y-4 p-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pencil className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-sm font-semibold text-white">
                    {isRTL ? 'عنوان الصفحة الرئيسي' : 'Page Header'}
                  </span>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">
                    {isRTL ? 'عنوان لوحة التحكم' : 'Dashboard Title'}
                  </Label>
                  <Input
                    value={titlesForm.dashboardTitle}
                    onChange={(e) => setTitlesForm({ ...titlesForm, dashboardTitle: e.target.value })}
                    className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                    placeholder={isRTL ? 'مثال: معلومات' : 'e.g. Info'}
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-500">
                    {isRTL ? 'وصف الصفحة (تحت العنوان)' : 'Page Description'}
                  </Label>
                  <Input
                    value={titlesForm.dashboardDescription}
                    onChange={(e) => setTitlesForm({ ...titlesForm, dashboardDescription: e.target.value })}
                    className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                    placeholder={isRTL ? 'مثال: متطلبات تركيب نظام Onyx IX' : 'e.g. System Requirements'}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pencil className="h-4 w-4 text-[#38BDF8]" />
                  <span className="text-sm font-semibold text-white">
                    {isRTL ? 'الشريط الجانبي' : 'Sidebar'}
                  </span>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">
                    {isRTL ? 'اسم التطبيق' : 'App Name'}
                  </Label>
                  <Input
                    value={titlesForm.sidebarAppName}
                    onChange={(e) => setTitlesForm({ ...titlesForm, sidebarAppName: e.target.value })}
                    className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                    placeholder="Onyx IX"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-500">
                    {isRTL ? 'النص تحت اسم التطبيق' : 'App Subtitle'}
                  </Label>
                  <Input
                    value={titlesForm.sidebarAppSubtitle}
                    onChange={(e) => setTitlesForm({ ...titlesForm, sidebarAppSubtitle: e.target.value })}
                    className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                    placeholder={isRTL ? 'متطلبات التركيب' : 'Installation Requirements'}
                  />
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleSaveTitles}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white"
              >
                {isRTL ? 'حفظ العناوين' : 'Save Titles'}
              </Button>
            </div>
          )}

          {activeTab === 'sections' && (
            <>
              {data.sections.map((section) => {
                const Icon = ICON_MAP[section.iconType] || Server;
                const isExpanded = expandedSections.has(section.id);
                return (
                  <div key={section.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors',
                        isRTL && 'flex-row-reverse'
                      )}
                      onClick={() => toggleExpandSection(section.id)}
                    >
                      <Icon className="h-4 w-4 shrink-0" style={{ color: section.color }} />
                      <span className="text-sm font-medium text-white flex-1">{section.title[isRTL ? 'ar' : 'en']}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {section.hw.length + section.sw.length} {isRTL ? 'عنصر' : 'items'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); setEditingSection({ ...section }); }}
                        className="shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                        className="shrink-0 text-[#EF4444] hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 space-y-2 border-t border-white/[0.04]">
                        <div className="pt-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {isRTL ? 'مواصفات العتاد' : 'H/W'}
                          </span>
                          {section.hw.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5 text-xs text-slate-400">
                              <span className="text-slate-600">{item.label[isRTL ? 'ar' : 'en']}:</span>
                              <span className="text-slate-300 font-mono">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {isRTL ? 'مواصفات البرمجيات' : 'S/W'}
                          </span>
                          {section.sw.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5 text-xs text-slate-400">
                              <span className="text-slate-600">{item.label[isRTL ? 'ar' : 'en']}:</span>
                              <span className="text-slate-300">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingSection({
                    id: genId(),
                    title: { ar: '', en: '' },
                    iconType: 'Server',
                    color: COLOR_PRESETS[data.sections.length % COLOR_PRESETS.length],
                    hw: [],
                    sw: [],
                  });
                }}
                className="w-full mt-2 border-dashed border-white/[0.1] text-slate-400 hover:text-white"
              >
                <Plus className="h-4 w-4 me-1" />
                {isRTL ? 'إضافة قسم جديد' : 'Add New Section'}
              </Button>
            </>
          )}

          {activeTab === 'requirements' && (
            <>
              {data.requirements.map((req, idx) => {
                const isExpanded = expandedReqs.has(idx);
                return (
                  <div key={idx} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors',
                        isRTL && 'flex-row-reverse'
                      )}
                      onClick={() => toggleExpandReq(idx)}
                    >
                      <Shield className="h-4 w-4 shrink-0 text-[#FF9800]" />
                      <span className="text-sm font-medium text-white flex-1">{req.category[isRTL ? 'ar' : 'en']}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {req.items.length} {isRTL ? 'عنصر' : 'items'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); setEditingReqIdx(idx); }}
                        className="shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteReq(idx); }}
                        className="shrink-0 text-[#EF4444] hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-white/[0.04] pt-2">
                        {req.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 py-1.5 text-xs text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9800]/60 shrink-0" />
                            <span>{item[isRTL ? 'ar' : 'en']}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addRequirement({
                    category: { ar: '', en: '' },
                    items: [],
                  });
                }}
                className="w-full mt-2 border-dashed border-white/[0.1] text-slate-400 hover:text-white"
              >
                <Plus className="h-4 w-4 me-1" />
                {isRTL ? 'إضافة قسم متطلبات جديد' : 'Add New Requirement Section'}
              </Button>
            </>
          )}
        </div>

      {/* Section Editor */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={handleSaveSection}
          onClose={() => setEditingSection(null)}
          isRTL={isRTL}
        />
      )}

      {/* Requirement Editor */}
      {editingReqIdx !== null && (
        <RequirementEditor
          req={data.requirements[editingReqIdx] || { category: { ar: '', en: '' }, items: [] }}
          onSave={(req) => handleSaveReq(req, editingReqIdx)}
          onClose={() => setEditingReqIdx(null)}
          isRTL={isRTL}
        />
      )}
    </EditorSidebar>
  );
}

function SectionEditor({
  section,
  onSave,
  onClose,
  isRTL,
}: {
  section: DashboardSection;
  onSave: (s: DashboardSection) => void;
  onClose: () => void;
  isRTL: boolean;
}) {
  const [form, setForm] = useState({ ...section });
  const [hwItems, setHwItems] = useState<HwItem[]>([...section.hw]);
  const [swItems, setSwItems] = useState<SwItem[]>([...section.sw]);

  const addHw = () => setHwItems([...hwItems, { iconType: 'Cpu', label: { ar: '', en: '' }, value: '' }]);
  const addSw = () => setSwItems([...swItems, { label: { ar: '', en: '' }, value: '' }]);
  const removeHw = (i: number) => setHwItems(hwItems.filter((_, idx) => idx !== i));
  const removeSw = (i: number) => setSwItems(swItems.filter((_, idx) => idx !== i));

  const updateHw = (i: number, field: string, value: string) => {
    const updated = [...hwItems];
    if (field === 'value') updated[i] = { ...updated[i], value };
    else if (field === 'iconType') updated[i] = { ...updated[i], iconType: value as HwItem['iconType'] };
    else if (field === 'labelAr') updated[i] = { ...updated[i], label: { ...updated[i].label, ar: value } };
    else if (field === 'labelEn') updated[i] = { ...updated[i], label: { ...updated[i].label, en: value } };
    setHwItems(updated);
  };

  const updateSw = (i: number, field: string, value: string) => {
    const updated = [...swItems];
    if (field === 'value') updated[i] = { ...updated[i], value };
    else if (field === 'labelAr') updated[i] = { ...updated[i], label: { ...updated[i].label, ar: value } };
    else if (field === 'labelEn') updated[i] = { ...updated[i], label: { ...updated[i].label, en: value } };
    setSwItems(updated);
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            {isRTL ? 'تعديل القسم' : 'Edit Section'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          {/* Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">{isRTL ? 'الاسم بالعربي' : 'Title (AR)'}</Label>
              <Input value={form.title.ar} onChange={(e) => setForm({ ...form, title: { ...form.title, ar: e.target.value } })} className="mt-1 bg-white/[0.04] border-white/[0.08] text-white" />
            </div>
            <div>
              <Label className="text-xs text-slate-500">{isRTL ? 'الاسم بالإنجليزي' : 'Title (EN)'}</Label>
              <Input value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })} className="mt-1 bg-white/[0.04] border-white/[0.08] text-white" />
            </div>
          </div>

          {/* Icon & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">{isRTL ? 'الأيقونة' : 'Icon'}</Label>
              <select
                value={form.iconType}
                onChange={(e) => setForm({ ...form, iconType: e.target.value as DashboardSection['iconType'] })}
                className="mt-1 w-full h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-sm text-white outline-none"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#111827] text-white">{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-slate-500">{isRTL ? 'اللون' : 'Color'}</Label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all',
                      form.color === c ? 'border-white scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* HW Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {isRTL ? 'مواصفات العتاد' : 'H/W Items'}
              </Label>
              <Button variant="ghost" size="sm" onClick={addHw} className="h-6 text-[10px]">
                <Plus className="h-3 w-3 me-1" /> {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </div>
            <div className="space-y-2">
              {hwItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <select
                    value={item.iconType}
                    onChange={(e) => updateHw(i, 'iconType', e.target.value)}
                    className="h-7 w-20 rounded border border-white/[0.08] bg-white/[0.04] px-1 text-[10px] text-white outline-none"
                  >
                    {HW_ICON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#111827]">{opt}</option>
                    ))}
                  </select>
                  <Input value={item.label.ar} onChange={(e) => updateHw(i, 'labelAr', e.target.value)} placeholder="AR" className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white w-16" />
                  <Input value={item.label.en} onChange={(e) => updateHw(i, 'labelEn', e.target.value)} placeholder="EN" className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white w-16" />
                  <Input value={item.value} onChange={(e) => updateHw(i, 'value', e.target.value)} placeholder={isRTL ? 'القيمة' : 'Value'} className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white flex-1" />
                  <Button variant="ghost" size="icon-sm" onClick={() => removeHw(i)} className="h-6 w-6 shrink-0 text-[#EF4444]">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* SW Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {isRTL ? 'مواصفات البرمجيات' : 'S/W Items'}
              </Label>
              <Button variant="ghost" size="sm" onClick={addSw} className="h-6 text-[10px]">
                <Plus className="h-3 w-3 me-1" /> {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </div>
            <div className="space-y-2">
              {swItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <Input value={item.label.ar} onChange={(e) => updateSw(i, 'labelAr', e.target.value)} placeholder="AR" className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white w-20" />
                  <Input value={item.label.en} onChange={(e) => updateSw(i, 'labelEn', e.target.value)} placeholder="EN" className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white w-20" />
                  <Input value={item.value} onChange={(e) => updateSw(i, 'value', e.target.value)} placeholder={isRTL ? 'القيمة' : 'Value'} className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white flex-1" />
                  <Button variant="ghost" size="icon-sm" onClick={() => removeSw(i)} className="h-6 w-6 shrink-0 text-[#EF4444]">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </DialogClose>
          <Button
            size="sm"
            onClick={() => onSave({ ...form, hw: hwItems, sw: swItems })}
            className="bg-[#18B13A] hover:bg-[#15803D] text-white"
          >
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequirementEditor({
  req,
  onSave,
  onClose,
  isRTL,
}: {
  req: RequirementCategory;
  onSave: (r: RequirementCategory) => void;
  onClose: () => void;
  isRTL: boolean;
}) {
  const [form, setForm] = useState({
    categoryAr: req.category.ar,
    categoryEn: req.category.en,
  });
  const [items, setItems] = useState<{ ar: string; en: string }[]>([...req.items]);

  const addItem = () => setItems([...items, { ar: '', en: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, lang: 'ar' | 'en', value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [lang]: value };
    setItems(updated);
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            {isRTL ? 'تعديل قسم المتطلبات' : 'Edit Requirement Section'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">{isRTL ? 'الاسم بالعربي' : 'Category (AR)'}</Label>
              <Input value={form.categoryAr} onChange={(e) => setForm({ ...form, categoryAr: e.target.value })} className="mt-1 bg-white/[0.04] border-white/[0.08] text-white" />
            </div>
            <div>
              <Label className="text-xs text-slate-500">{isRTL ? 'الاسم بالإنجليزي' : 'Category (EN)'}</Label>
              <Input value={form.categoryEn} onChange={(e) => setForm({ ...form, categoryEn: e.target.value })} className="mt-1 bg-white/[0.04] border-white/[0.08] text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {isRTL ? 'العناصر' : 'Items'}
              </Label>
              <Button variant="ghost" size="sm" onClick={addItem} className="h-6 text-[10px]">
                <Plus className="h-3 w-3 me-1" /> {isRTL ? 'إضافة' : 'Add'}
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <Input value={item.ar} onChange={(e) => updateItem(i, 'ar', e.target.value)} placeholder="عربي" className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white flex-1" />
                  <Input value={item.en} onChange={(e) => updateItem(i, 'en', e.target.value)} placeholder="English" className="h-7 text-[10px] bg-transparent border-white/[0.06] text-white flex-1" />
                  <Button variant="ghost" size="icon-sm" onClick={() => removeItem(i)} className="h-6 w-6 shrink-0 text-[#EF4444]">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </DialogClose>
          <Button
            size="sm"
            onClick={() => onSave({ category: { ar: form.categoryAr, en: form.categoryEn }, items })}
            className="bg-[#FF9800] hover:bg-[#E68A00] text-white"
          >
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

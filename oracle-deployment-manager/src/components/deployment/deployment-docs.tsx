'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FileText,
  ExternalLink,
  Users,
  Briefcase,
  Search,
  ChevronDown,
  ChevronRight,
  Terminal,
  Database,
  Server,
  Globe,
  BookOpen,
  Settings,
  Shield,
  Package,
  Pencil,
  Link2,
  Wrench,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDeploymentDocsStore, type DocStep, type DocAttachment } from '@/stores/deployment-docs-store';
import { DeploymentDocsEditor } from '@/components/deployment/deployment-docs-editor';
import { useLocale } from '@/hooks/use-locale';
import { useAppStore } from '@/stores/app-store';
import { CanEdit } from '@/components/ui/can-edit';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STEP_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Terminal,
  2: Database,
  3: Server,
  4: Globe,
};

const STEP_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  2: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  3: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  4: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
};

function StepFileRow({
  file,
  step,
  isRTL,
  onUploadReplace,
  uploadingId,
  onRemove,
}: {
  file: DocAttachment;
  step: DocStep;
  isRTL: boolean;
  onUploadReplace: (stepId: string, fileId: string, file: File) => void;
  uploadingId: string | null;
  onRemove: (stepId: string, fileId: string) => void;
}) {
  const stepColor = step.step ? STEP_COLORS[step.step] : STEP_COLORS[1];
  const StepIcon = step.step ? STEP_ICONS[step.step] || FileText : FileText;
  const isDataUri = file.href.startsWith('data:');

  function handleClick(e: React.MouseEvent) {
    if (!isDataUri) return;
    e.preventDefault();
    const parts = file.href.match(/^data:([^;]+);base64,(.+)$/);
    if (!parts) return;
    const mime = parts[1];
    const b64 = parts[2];
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  return (
    <motion.a
      href={isDataUri ? undefined : file.href}
      target={isDataUri ? undefined : '_blank'}
      rel="noopener noreferrer"
      onClick={handleClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-pointer flex-row-reverse text-right relative"
    >
      <div className={cn('p-2 rounded-lg shrink-0', stepColor.bg)}>
        <StepIcon className={cn('h-4 w-4', stepColor.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium group-hover:text-amber-300 transition-colors leading-tight">
          {file.nameAr}
        </h4>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">{file.href}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-amber-500 shrink-0 mt-0.5 transition-colors" />

      {/* Inline action buttons - appear on hover */}
      <div className="absolute top-2 start-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {uploadingId === file.id ? (
          <Badge variant="secondary" className="text-[9px] animate-pulse h-5">
            {isRTL ? 'جاري...' : '...'}
          </Badge>
        ) : (
          <label
            className="text-blue-500 hover:text-blue-400 p-1 rounded-md bg-background/80 backdrop-blur cursor-pointer"
            title={isRTL ? 'استبدال بالرفع' : 'Replace via upload'}
          >
            <Upload className="h-3 w-3" />
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.zip"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadReplace(step.id, file.id, f);
                e.target.value = '';
              }}
            />
          </label>
        )}
        <button
          onClick={(e) => { e.preventDefault(); onRemove(step.id, file.id); }}
          className="text-red-500/60 hover:text-red-500 p-1 rounded-md bg-background/80 backdrop-blur"
          title={isRTL ? 'حذف' : 'Delete'}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </motion.a>
  );
}

interface DocCategory {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: DocStep[];
}

function groupEngineerSteps(steps: DocStep[]): DocCategory[] {
  const categories: DocCategory[] = [
    { id: 'install', title: 'System Installation', titleAr: 'تثبيت النظام', icon: Terminal, color: 'text-emerald-500', items: steps.filter((s) => s.step === 1) },
    { id: 'database', title: 'Database Setup', titleAr: 'إعداد قاعدة البيانات', icon: Database, color: 'text-blue-500', items: steps.filter((s) => s.step === 2) },
    { id: 'middleware', title: 'Middleware & Services', titleAr: 'الطبقة الوسيطة والخدمات', icon: Server, color: 'text-amber-500', items: steps.filter((s) => s.step === 3) },
    { id: 'browsers', title: 'Browser Configuration', titleAr: 'تكوين المتصفحات', icon: Globe, color: 'text-purple-500', items: steps.filter((s) => s.step === 4) },
    { id: 'guides', title: 'Installation Guides', titleAr: 'أدلة التثبيت', icon: BookOpen, color: 'text-cyan-500', items: steps.filter((s) => !s.step) },
  ];
  return categories.filter((c) => c.items.length > 0);
}

function groupConsultantSteps(steps: DocStep[]): DocCategory[] {
  const categories: DocCategory[] = [
    {
      id: 'basics', title: 'Basics & Setup', titleAr: 'الأساسيات والإعداد', icon: Settings, color: 'text-blue-500',
      items: steps.filter((s) => ['أساسيات', 'الإعدادات', 'التهيئة', 'إدارة النظام'].some((k) => s.titleAr.includes(k))),
    },
    {
      id: 'hr', title: 'Human Resources', titleAr: 'الموارد البشرية', icon: Users, color: 'text-emerald-500',
      items: steps.filter((s) => ['الموارد البشرية', 'الأجور', 'المرتبات', 'الحضور', 'الانصراف', 'الكفاءات', 'المواهب', 'رأس المال البشري', 'الإرتباط الوظيفي'].some((k) => s.titleAr.includes(k))),
    },
    {
      id: 'finance', title: 'Finance & Accounting', titleAr: 'المالية والحسابات', icon: Shield, color: 'text-amber-500',
      items: steps.filter((s) => ['الأستاذ العام', 'البنوك', 'التسهيلات البنكية', 'القروض', 'العمولات', 'الترحيل', 'المراجعة'].some((k) => s.titleAr.includes(k))),
    },
    {
      id: 'inventory', title: 'Inventory & Supply Chain', titleAr: 'المخزون وسلسلة التوريد', icon: Package, color: 'text-orange-500',
      items: steps.filter((s) => ['المخزون', 'المشتريات', 'الموردين', 'المبيعات', 'الجرد', 'التوزيع', 'العملاء', 'المتجر', 'الحجوزات', 'المنتجات', 'الأصول', 'الاسطول', 'الصيانة', 'الجودة', 'الإنتاج', 'المشاريع', 'العقارات'].some((k) => s.titleAr.includes(k))),
    },
  ];
  return categories.filter((c) => c.items.length > 0);
}

function CategorySection({
  category,
  isRTL,
  searchQuery,
  onUploadFile,
  onUploadReplace,
  onRemoveFile,
  uploadingId,
}: {
  category: DocCategory;
  isRTL: boolean;
  searchQuery: string;
  onUploadFile: (stepId: string, file: File) => void;
  onUploadReplace: (stepId: string, fileId: string, file: File) => void;
  onRemoveFile: (stepId: string, fileId: string) => void;
  uploadingId: string | null;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = category.icon;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return category.items;
    const q = searchQuery.toLowerCase();
    return category.items.filter(
      (s) =>
        s.titleAr.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.descriptionAr.toLowerCase().includes(q) ||
        s.files.some((f) => f.nameAr.toLowerCase().includes(q))
    );
  }, [category.items, searchQuery]);

  if (filteredItems.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors flex-row-reverse">
          <div className="p-1.5 rounded-lg bg-white/5">
            <Icon className={cn('h-4 w-4', category.color)} />
          </div>
          <div className="flex-1 text-right">
            <span className="text-sm font-medium">{category.titleAr}</span>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {filteredItems.length}
          </Badge>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-2 pb-2 space-y-1.5">
          {filteredItems.map((step) => (
            <div key={step.id} className="space-y-1">
              {step.files.length > 0 && (
                <AnimatePresence mode="popLayout">
                  {step.files.map((file) => (
                    <StepFileRow
                      key={file.id}
                      file={file}
                      step={step}
                      isRTL={isRTL}
                      onUploadReplace={onUploadReplace}
                      uploadingId={uploadingId}
                      onRemove={onRemoveFile}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Upload new file to this step */}
              <div className="ps-12">
                <label className="inline-flex items-center gap-1.5 text-[10px] text-amber-500/70 hover:text-amber-500 cursor-pointer transition-colors">
                  <Upload className="h-3 w-3" />
                  {isRTL ? 'ارفع ملف' : 'Upload file'}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.zip"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUploadFile(step.id, f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SectionContent({
  steps,
  isRTL,
  isConsultant,
  emptyIcon,
  emptyTitle,
  onUploadFile,
  onUploadReplace,
  onRemoveFile,
  uploadingId,
}: {
  steps: DocStep[];
  isRTL: boolean;
  isConsultant: boolean;
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  onUploadFile: (stepId: string, file: File) => void;
  onUploadReplace: (stepId: string, fileId: string, file: File) => void;
  onRemoveFile: (stepId: string, fileId: string) => void;
  uploadingId: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = isConsultant ? groupConsultantSteps(steps) : groupEngineerSteps(steps);

  const filteredSteps = useMemo(() => {
    if (!searchQuery) return steps;
    const q = searchQuery.toLowerCase();
    return steps.filter(
      (s) =>
        s.titleAr.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.descriptionAr.toLowerCase().includes(q) ||
        s.files.some((f) => f.nameAr.toLowerCase().includes(q))
    );
  }, [steps, searchQuery]);

  const EmptyIcon = emptyIcon;

  return (
    <div className="space-y-3">
      <div className="relative direction-rtl">
        <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground end-3" />
        <Input
          placeholder="ابحث عن ملف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pe-9 ps-3 text-end"
        />
      </div>

      {searchQuery ? (
        <div className="space-y-1.5 px-2">
          {filteredSteps.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <EmptyIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">لا توجد نتائج</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredSteps.map((step) =>
                step.files.map((file) => (
                  <StepFileRow
                    key={file.id}
                    file={file}
                    step={step}
                    isRTL={true}
                    onUploadReplace={onUploadReplace}
                    uploadingId={uploadingId}
                    onRemove={onRemoveFile}
                  />
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-1">
            {categories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                isRTL={isRTL}
                searchQuery=""
                onUploadFile={onUploadFile}
                onUploadReplace={onUploadReplace}
                onRemoveFile={onRemoveFile}
                uploadingId={uploadingId}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export function DeploymentDocs() {
  const [activeTab, setActiveTab] = useState('engineers');
  const [editorOpen, setEditorOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { steps, init: initDocs, addFile, removeFile, updateFile } = useDeploymentDocsStore();
  const { isRTL } = useLocale();
  const { addNotification } = useAppStore();

  useEffect(() => {
    initDocs();
  }, [initDocs]);

  async function handleUploadFile(stepId: string, file: File) {
    setUploadingId(`upload-${Date.now()}`);
    try {
      const base64 = await fileToBase64(file);
      const fid = `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      addFile(stepId, {
        id: fid,
        name: file.name.replace(/\.[^.]+$/, ''),
        nameAr: file.name.replace(/\.[^.]+$/, ''),
        href: base64,
      });
      addNotification({ type: 'success', title: isRTL ? 'تم رفع الملف' : 'File uploaded', message: file.name });
    } catch {
      addNotification({ type: 'error', title: isRTL ? 'فشل الرفع' : 'Upload failed', message: '' });
    }
    setUploadingId(null);
  }

  async function handleUploadReplace(stepId: string, fileId: string, file: File) {
    setUploadingId(fileId);
    try {
      const base64 = await fileToBase64(file);
      updateFile(stepId, fileId, { href: base64, name: file.name.replace(/\.[^.]+$/, ''), nameAr: file.name.replace(/\.[^.]+$/, '') });
      addNotification({ type: 'success', title: isRTL ? 'تم استبدال الملف' : 'File replaced', message: file.name });
    } catch {
      addNotification({ type: 'error', title: isRTL ? 'فشل الرفع' : 'Upload failed', message: '' });
    }
    setUploadingId(null);
  }

  function handleRemoveFile(stepId: string, fileId: string) {
    removeFile(stepId, fileId);
  }

  const engineerSteps = steps.filter((s) => s.category === 'engineer');
  const consultantSteps = steps.filter((s) => s.category === 'consultant');
  const engineerFiles = engineerSteps.reduce((acc, s) => acc + s.files.length, 0);
  const consultantFiles = consultantSteps.reduce((acc, s) => acc + s.files.length, 0);

  return (
    <div dir="rtl" className="space-y-4 text-right">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between overflow-x-auto">
          <TabsList variant="line" className="h-10 min-w-0 flex-nowrap">
            <TabsTrigger value="engineers" className="gap-1.5 px-3 md:gap-2 md:px-4 whitespace-nowrap">
              <Users className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">قسم المهندسين</span>
              <span className="sm:hidden">المهندسين</span>
              <Badge variant="secondary" className="text-[10px] ms-1">
                {engineerFiles}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="consultants" className="gap-1.5 px-3 md:gap-2 md:px-4 whitespace-nowrap">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">قسم المحاسبين</span>
              <span className="sm:hidden">المحاسبين</span>
              <Badge variant="secondary" className="text-[10px] ms-1">
                {consultantFiles}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="engineers">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-semibold">
                    توثيق وتثبيت النظام
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {engineerFiles} ملف
                  </Badge>
                  <CanEdit>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditorOpen(true)}
                      className="gap-1.5 text-xs text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl h-7"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                  </CanEdit>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SectionContent
                steps={engineerSteps}
                isRTL={true}
                isConsultant={false}
                emptyIcon={Wrench}
                emptyTitle="لا توجد ملفات"
                onUploadFile={handleUploadFile}
                onUploadReplace={handleUploadReplace}
                onRemoveFile={handleRemoveFile}
                uploadingId={uploadingId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultants">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm font-semibold">
                    توثيق المحاسبين
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {consultantFiles} ملف
                  </Badge>
                  <CanEdit>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditorOpen(true)}
                      className="gap-1.5 text-xs text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl h-7"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                  </CanEdit>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SectionContent
                steps={consultantSteps}
                isRTL={true}
                isConsultant={true}
                emptyIcon={Briefcase}
                emptyTitle="لا توجد ملفات"
                onUploadFile={handleUploadFile}
                onUploadReplace={handleUploadReplace}
                onRemoveFile={handleRemoveFile}
                uploadingId={uploadingId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CanEdit>
        <DeploymentDocsEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          filterTab={activeTab === 'engineers' ? 'engineer' : 'consultant'}
        />
      </CanEdit>
    </div>
  );
}

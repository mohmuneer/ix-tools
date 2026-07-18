'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Wrench,
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ENGINEER_DOCS, CONSULTANT_DOCS, type DocFile } from '@/lib/deployment-docs';

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

interface DocCategory {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: DocFile[];
}

function groupByCategory(docs: DocFile[], isRTL: boolean): DocCategory[] {
  const categories: DocCategory[] = [
    {
      id: 'install',
      title: 'System Installation',
      titleAr: 'تثبيت النظام',
      icon: Terminal,
      color: 'text-emerald-500',
      items: docs.filter((d) => d.step === 1),
    },
    {
      id: 'database',
      title: 'Database Setup',
      titleAr: 'إعداد قاعدة البيانات',
      icon: Database,
      color: 'text-blue-500',
      items: docs.filter((d) => d.step === 2),
    },
    {
      id: 'middleware',
      title: 'Middleware & Services',
      titleAr: 'الطبقة الوسيطة والخدمات',
      icon: Server,
      color: 'text-amber-500',
      items: docs.filter((d) => d.step === 3),
    },
    {
      id: 'browsers',
      title: 'Browser Configuration',
      titleAr: 'تكوين المتصفحات',
      icon: Globe,
      color: 'text-purple-500',
      items: docs.filter((d) => d.step === 4),
    },
    {
      id: 'guides',
      title: 'Installation Guides',
      titleAr: 'أدلة التثبيت',
      icon: BookOpen,
      color: 'text-cyan-500',
      items: docs.filter((d) => !d.step),
    },
  ];
  return categories.filter((c) => c.items.length > 0);
}

function groupConsultantDocs(docs: DocFile[]): DocCategory[] {
  const categories: DocCategory[] = [
    {
      id: 'basics',
      title: 'Basics & Setup',
      titleAr: 'الأساسيات والإعداد',
      icon: Settings,
      color: 'text-blue-500',
      items: docs.filter((d) =>
        ['أساسيات', 'الإعدادات', 'التهيئة', 'إدارة النظام'].some((k) =>
          d.titleAr.includes(k)
        )
      ),
    },
    {
      id: 'hr',
      title: 'Human Resources',
      titleAr: 'الموارد البشرية',
      icon: Users,
      color: 'text-emerald-500',
      items: docs.filter((d) =>
        ['الموارد البشرية', 'الأجور', 'المرتبات', 'الحضور', 'الانصراف', 'الكفاءات', 'المواهب', 'رأس المال البشري', 'الإرتباط الوظيفي'].some((k) =>
          d.titleAr.includes(k)
        )
      ),
    },
    {
      id: 'finance',
      title: 'Finance & Accounting',
      titleAr: 'المالية والحسابات',
      icon: Shield,
      color: 'text-amber-500',
      items: docs.filter((d) =>
        ['الأستاذ العام', 'البنوك', 'التسهيلات البنكية', 'القروض', 'العمولات', 'الترحيل', 'المراجعة'].some((k) =>
          d.titleAr.includes(k)
        )
      ),
    },
    {
      id: 'inventory',
      title: 'Inventory & Supply Chain',
      titleAr: 'المخزون وسلسلة التوريد',
      icon: Package,
      color: 'text-orange-500',
      items: docs.filter((d) =>
        ['المخزون', 'المشتريات', 'الموردين', 'المبيعات', 'الجرد', 'التوزيع', 'العملاء', 'المتجر', 'الحجوزات', 'المنتجات', 'الأصول', 'الاسطول', 'الصيانة', 'الجودة', 'الإنتاج', 'المشاريع', 'العقارات'].some((k) =>
          d.titleAr.includes(k)
        )
      ),
    },
  ];
  return categories.filter((c) => c.items.length > 0);
}

function DocCard({ doc, index, isRTL }: { doc: DocFile; index: number; isRTL: boolean }) {
  const stepColor = doc.step ? STEP_COLORS[doc.step] : STEP_COLORS[1];
  const StepIcon = doc.step ? STEP_ICONS[doc.step] || FileText : FileText;

  return (
    <motion.a
      href={doc.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-pointer flex-row-reverse text-right"
    >
      <div className={cn('p-2 rounded-lg shrink-0', stepColor.bg)}>
        <StepIcon className={cn('h-4 w-4', stepColor.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium group-hover:text-amber-300 transition-colors leading-tight">
          {doc.titleAr}
        </h4>
        {doc.descriptionAr !== doc.titleAr && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
            {doc.descriptionAr}
          </p>
        )}
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-amber-500 shrink-0 mt-0.5 transition-colors" />
    </motion.a>
  );
}

function CategorySection({
  category,
  isRTL,
  searchQuery,
}: {
  category: DocCategory;
  isRTL: boolean;
  searchQuery: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = category.icon;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return category.items;
    const q = searchQuery.toLowerCase();
    return category.items.filter(
      (d) =>
        d.titleAr.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.descriptionAr.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
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
          <AnimatePresence mode="popLayout">
            {filteredItems.map((doc, i) => (
              <DocCard key={doc.id} doc={doc} index={i} isRTL={isRTL} />
            ))}
          </AnimatePresence>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SectionContent({
  docs,
  isRTL,
  emptyIcon,
  emptyTitle,
  emptyDesc,
}: {
  docs: DocFile[];
  isRTL: boolean;
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDesc: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const isConsultant = docs.length > 0 && docs[0].category === 'consultant';
  const categories = isConsultant
    ? groupConsultantDocs(docs)
    : groupByCategory(docs, isRTL);

  const filteredDocs = useMemo(() => {
    if (!searchQuery) return docs;
    const q = searchQuery.toLowerCase();
    return docs.filter(
      (d) =>
        d.titleAr.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.descriptionAr.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }, [docs, searchQuery]);

  const EmptyIcon = emptyIcon;

  return (
    <div className="space-y-3">
      <div className="relative direction-rtl">
        <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground right-3" />
        <Input
          placeholder="ابحث عن ملف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-9 pl-3 text-right"
        />
      </div>

      {searchQuery ? (
        <div className="space-y-1.5 px-2">
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <EmptyIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">لا توجد نتائج</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc, i) => (
                <DocCard key={doc.id} doc={doc} index={i} isRTL={true} />
              ))}
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
                {ENGINEER_DOCS.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="consultants" className="gap-1.5 px-3 md:gap-2 md:px-4 whitespace-nowrap">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">قسم المحاسبين</span>
              <span className="sm:hidden">المحاسبين</span>
              <Badge variant="secondary" className="text-[10px] ms-1">
                {CONSULTANT_DOCS.length}
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
                <Badge variant="outline" className="text-[10px]">
                  {ENGINEER_DOCS.length} ملف
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SectionContent
                docs={ENGINEER_DOCS}
                isRTL={true}
                emptyIcon={Wrench}
                emptyTitle="لا توجد ملفات"
                emptyDesc="لم يتم العثور على ملفات"
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
                <Badge variant="outline" className="text-[10px]">
                  {CONSULTANT_DOCS.length} ملف
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SectionContent
                docs={CONSULTANT_DOCS}
                isRTL={true}
                emptyIcon={Briefcase}
                emptyTitle="لا توجد ملفات"
                emptyDesc="لم يتم العثور على ملفات"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { create } from 'zustand';
import type { DashboardData, DashboardSection, RequirementCategory, PageTitles } from '@/types';

const STORAGE_KEY = 'dashboard-data';

const DEFAULT_SECTIONS: DashboardSection[] = [
  {
    id: 'database',
    title: { ar: 'خادم قاعدة البيانات', en: 'DATABASE SERVER' },
    iconType: 'Database',
    color: '#38BDF8',
    hw: [
      { iconType: 'Cpu', label: { ar: 'المعالج', en: 'CPU' }, value: '8+ cores' },
      { iconType: 'MemoryStick', label: { ar: 'الذاكرة', en: 'RAM' }, value: '16+ GB' },
      { iconType: 'HardDrive', label: { ar: 'التخزين', en: 'STORAGE' }, value: '1 TB SSD (Net after RAID)' },
      { iconType: 'HardDrive', label: { ar: 'أرشيف', en: 'ARCHIVING' }, value: '+500 GB SSD (Net after RAID)' },
      { iconType: 'Wifi', label: { ar: 'شبكة', en: 'NETWORKS' }, value: '1x Private' },
    ],
    sw: [
      { label: { ar: 'نظام التشغيل', en: 'OS' }, value: 'Oracle Enterprise Linux 8.9' },
    ],
  },
  {
    id: 'application',
    title: { ar: 'خادم التطبيقات', en: 'APPLICATION SERVER' },
    iconType: 'Server',
    color: '#18B13A',
    hw: [
      { iconType: 'Cpu', label: { ar: 'المعالج', en: 'CPU' }, value: '8+ cores' },
      { iconType: 'MemoryStick', label: { ar: 'الذاكرة', en: 'RAM' }, value: '20+ GB' },
      { iconType: 'HardDrive', label: { ar: 'التخزين', en: 'STORAGE' }, value: '500 GB SSD (Net after RAID)' },
      { iconType: 'Wifi', label: { ar: 'شبكة', en: 'NETWORKS' }, value: '2x (1 Public + 1 Private)' },
    ],
    sw: [
      { label: { ar: 'نظام التشغيل', en: 'OS' }, value: 'Windows Server 2012+ Standard/Datacenter' },
      { label: { ar: 'جدار الحماية', en: 'Firewall' }, value: 'Recommended for security' },
      { label: { ar: 'الحماية من الفيروسات', en: 'Anti Virus' }, value: 'Original Version' },
      { label: { ar: 'IP عام', en: 'Public IP' }, value: 'For Remote Access' },
      { label: { ar: 'النسخ الاحتياطي', en: 'Backup' }, value: 'Recommended Solution' },
    ],
  },
];

const DEFAULT_REQUIREMENTS: RequirementCategory[] = [
  {
    category: { ar: 'متطلبات النظام', en: 'System Requirements' },
    items: [
      { ar: 'Oracle Database 12c / 21c', en: 'Oracle Database 12c / 21c' },
      { ar: 'Oracle Forms & Reports 12c', en: 'Oracle Forms & Reports 12c' },
      { ar: 'WebLogic Server 12c', en: 'WebLogic Server 12c' },
      { ar: 'Java JDK 7+ / JRE 8+', en: 'Java JDK 7+ / JRE 8+' },
    ],
  },
  {
    category: { ar: 'متطلبات قاعدة البيانات', en: 'Database Requirements' },
    items: [
      { ar: 'Character Set: AL32UTF8', en: 'Character Set: AL32UTF8' },
      { ar: 'Pluggable Database (PDB)', en: 'Pluggable Database (PDB)' },
      { ar: 'Open Cursors: 20000', en: 'Open Cursors: 20000' },
      { ar: 'Processes: 5000', en: 'Processes: 5000' },
      { ar: 'Deferred Segment Creation: FALSE', en: 'Deferred Segment Creation: FALSE' },
      { ar: 'NLS Length Semantics: CHAR', en: 'NLS Length Semantics: CHAR' },
    ],
  },
  {
    category: { ar: 'متطلبات الشبكة', en: 'Network Requirements' },
    items: [
      { ar: 'tnsnames.ora Configuration', en: 'tnsnames.ora Configuration' },
      { ar: 'Listener Running on Port 1521', en: 'Listener Running on Port 1521' },
      { ar: 'Firewall Ports Open (1521, 7001, 8888)', en: 'Firewall Ports Open (1521, 7001, 8888)' },
    ],
  },
  {
    category: { ar: 'برامج العميل', en: 'Client Software' },
    items: [
      { ar: 'JRE 8+ (لتشغيل Oracle Forms)', en: 'JRE 8+ (for Oracle Forms)' },
      { ar: 'Modern Browser (Chrome / Firefox / Edge)', en: 'Modern Browser (Chrome / Firefox / Edge)' },
      { ar: 'WINSCP (للإدارة)', en: 'WINSCP (for administration)' },
      { ar: 'Putty (للاتصال بالخادم)', en: 'Putty (for SSH access)' },
    ],
  },
];

const DEFAULT_PAGE_TITLES: PageTitles = {
  dashboardTitle: 'معلومات',
  dashboardDescription: 'متطلبات تركيب نظام Onyx IX',
  sidebarAppName: 'Onyx IX',
  sidebarAppSubtitle: 'متطلبات التركيب',
};

function loadFromStorage(): DashboardData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardData;
  } catch {
    return null;
  }
}

function saveToStorage(data: DashboardData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface DashboardState {
  data: DashboardData;
  initialized: boolean;
  init: () => void;
  setSections: (sections: DashboardSection[]) => void;
  addSection: (section: DashboardSection) => void;
  updateSection: (id: string, section: Partial<DashboardSection>) => void;
  removeSection: (id: string) => void;
  setRequirements: (requirements: RequirementCategory[]) => void;
  addRequirement: (req: RequirementCategory) => void;
  updateRequirement: (index: number, req: Partial<RequirementCategory>) => void;
  removeRequirement: (index: number) => void;
  setPageTitles: (titles: PageTitles) => void;
  resetToDefaults: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: { sections: DEFAULT_SECTIONS, requirements: DEFAULT_REQUIREMENTS, pageTitles: DEFAULT_PAGE_TITLES },
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = loadFromStorage();
    if (stored) {
      set({ data: stored, initialized: true });
    } else {
      saveToStorage(get().data);
      set({ initialized: true });
    }
  },

  setSections: (sections) => {
    const data = { ...get().data, sections };
    saveToStorage(data);
    set({ data });
  },

  addSection: (section) => {
    const data = { ...get().data, sections: [...get().data.sections, section] };
    saveToStorage(data);
    set({ data });
  },

  updateSection: (id, partial) => {
    const sections = get().data.sections.map((s) =>
      s.id === id ? { ...s, ...partial } : s
    );
    const data = { ...get().data, sections };
    saveToStorage(data);
    set({ data });
  },

  removeSection: (id) => {
    const data = { ...get().data, sections: get().data.sections.filter((s) => s.id !== id) };
    saveToStorage(data);
    set({ data });
  },

  setRequirements: (requirements) => {
    const data = { ...get().data, requirements };
    saveToStorage(data);
    set({ data });
  },

  addRequirement: (req) => {
    const data = { ...get().data, requirements: [...get().data.requirements, req] };
    saveToStorage(data);
    set({ data });
  },

  updateRequirement: (index, partial) => {
    const requirements = get().data.requirements.map((r, i) =>
      i === index ? { ...r, ...partial } : r
    );
    const data = { ...get().data, requirements };
    saveToStorage(data);
    set({ data });
  },

  removeRequirement: (index) => {
    const data = { ...get().data, requirements: get().data.requirements.filter((_, i) => i !== index) };
    saveToStorage(data);
    set({ data });
  },

  setPageTitles: (titles) => {
    const data = { ...get().data, pageTitles: titles };
    saveToStorage(data);
    set({ data });
  },

  resetToDefaults: () => {
    const data = { sections: DEFAULT_SECTIONS, requirements: DEFAULT_REQUIREMENTS, pageTitles: DEFAULT_PAGE_TITLES };
    saveToStorage(data);
    set({ data });
  },
}));

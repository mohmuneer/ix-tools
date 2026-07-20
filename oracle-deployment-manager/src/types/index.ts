export interface SystemInfo {
  hostname: string;
  os: string;
  windowsVersion: string;
  javaVersion: string;
  formsVersion: string;
  reportsVersion: string;
  weblogicStatus: 'running' | 'stopped' | 'error';
  nodeManagerStatus: 'running' | 'stopped' | 'error';
  listenerStatus: 'running' | 'stopped' | 'error';
  databaseStatus: 'running' | 'stopped' | 'error';
  diskSpace: { total: number; used: number; free: number };
  memory: { total: number; used: number; free: number };
  cpu: { usage: number; cores: number };
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  extension: string;
  permissions?: string;
}

export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  content: string;
  lastModified: string;
  version: number;
  isSystemFile: boolean;
}

export interface DeployProfile {
  id: string;
  name: string;
  description: string;
  customerName: string;
  settings: DeploySettings;
  createdAt: string;
  updatedAt: string;
}

export interface DeploySettings {
  host: string;
  port: string;
  service_name: string;
  forms_path: string;
  reports_path: string;
  java_home: string;
  domain_home: string;
  instance_home: string;
  database_name: string;
  [key: string]: string;
}

export interface DeployStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  message?: string;
  startTime?: string;
  endTime?: string;
}

export interface DeployJob {
  id: string;
  profileId: string;
  profileName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  steps: DeployStep[];
  startedAt: string;
  completedAt?: string;
  logEntries: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  source?: string;
}

export interface Template {
  id: string;
  name: string;
  region: string;
  description: string;
  settings: Partial<DeploySettings>;
  files?: TemplateFile[];
  createdAt: string;
}

export interface TemplateFile {
  id: string;
  templateId: string;
  name: string;
  path: string;
  size: number;
  extension: string;
  uploadedAt: string;
  status?: 'idle' | 'running' | 'success' | 'error';
  output?: string;
}

export interface BackupEntry {
  id: string;
  fileName: string;
  originalPath: string;
  backupPath: string;
  createdAt: string;
  profileId?: string;
  jobId?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'operator' | 'viewer';
  createdAt: string;
}

export interface HwItem {
  iconType: 'Cpu' | 'MemoryStick' | 'HardDrive' | 'Wifi' | 'Globe' | 'Shield' | 'Download' | 'Server' | 'Database';
  label: { ar: string; en: string };
  value: string;
}

export interface SwItem {
  label: { ar: string; en: string };
  value: string;
}

export interface DashboardSection {
  id: string;
  title: { ar: string; en: string };
  iconType: 'Database' | 'Server' | 'Cpu' | 'MemoryStick' | 'HardDrive' | 'Wifi' | 'Globe' | 'Shield' | 'Download';
  color: string;
  hw: HwItem[];
  sw: SwItem[];
}

export interface RequirementCategory {
  category: { ar: string; en: string };
  items: { ar: string; en: string }[];
}

export interface PageTitles {
  dashboardTitle: string;
  dashboardDescription: string;
  sidebarAppName: string;
  sidebarAppSubtitle: string;
}

export interface DashboardData {
  sections: DashboardSection[];
  requirements: RequirementCategory[];
  pageTitles: PageTitles;
}

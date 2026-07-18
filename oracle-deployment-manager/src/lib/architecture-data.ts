export interface ArchitectureTool {
  id: string;
  tier: 'client' | 'application' | 'database';
  name: string;
  roleTitle: string;
  description: string;
  integrationBenefit: string;
  relatedGuideTitle?: string;
  serviceKey?: 'weblogicStatus' | 'databaseStatus' | 'listenerStatus';
  icon: string;
}

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  highlightTier: 'client' | 'application' | 'database';
  highlightToolIds: string[];
}

export interface GuideCard {
  id: string;
  title: string;
  description: string;
  href?: string;
}

export const ARCHITECTURE_TOOLS: ArchitectureTool[] = [
  {
    id: 'web-browser',
    tier: 'client',
    name: 'Web Browser',
    roleTitle: 'arch.tools.webBrowser.role',
    description: 'arch.tools.webBrowser.desc',
    integrationBenefit: 'arch.tools.webBrowser.benefit',
    icon: 'Globe',
  },
  {
    id: 'java-jre',
    tier: 'client',
    name: 'Java JRE 8',
    roleTitle: 'arch.tools.javaJre.role',
    description: 'arch.tools.javaJre.desc',
    integrationBenefit: 'arch.tools.javaJre.benefit',
    icon: 'Coffee',
  },
  {
    id: 'pos-terminal',
    tier: 'client',
    name: 'POS Terminal',
    roleTitle: 'arch.tools.posTerminal.role',
    description: 'arch.tools.posTerminal.desc',
    integrationBenefit: 'arch.tools.posTerminal.benefit',
    icon: 'MonitorCheck',
  },
  {
    id: 'weblogic',
    tier: 'application',
    name: 'Oracle WebLogic 10.3.6',
    roleTitle: 'arch.tools.weblogic.role',
    description: 'arch.tools.weblogic.desc',
    integrationBenefit: 'arch.tools.weblogic.benefit',
    relatedGuideTitle: 'arch.guides.appServer',
    serviceKey: 'weblogicStatus',
    icon: 'Server',
  },
  {
    id: 'forms-reports',
    tier: 'application',
    name: 'Oracle Forms & Reports 11g',
    roleTitle: 'arch.tools.formsReports.role',
    description: 'arch.tools.formsReports.desc',
    integrationBenefit: 'arch.tools.formsReports.benefit',
    relatedGuideTitle: 'arch.guides.formsPatch',
    icon: 'FileSpreadsheet',
  },
  {
    id: 'ords-apex',
    tier: 'application',
    name: 'ORDS + APEX',
    roleTitle: 'arch.tools.ordsApex.role',
    description: 'arch.tools.ordsApex.desc',
    integrationBenefit: 'arch.tools.ordsApex.benefit',
    relatedGuideTitle: 'arch.guides.ordsApex',
    icon: 'Globe2',
  },
  {
    id: 'reports-servers',
    tier: 'application',
    name: 'Oracle Reports Servers',
    roleTitle: 'arch.tools.reportsServers.role',
    description: 'arch.tools.reportsServers.desc',
    integrationBenefit: 'arch.tools.reportsServers.benefit',
    icon: 'FileBarChart',
  },
  {
    id: 'jdk',
    tier: 'application',
    name: 'JDK 7',
    roleTitle: 'arch.tools.jdk.role',
    description: 'arch.tools.jdk.desc',
    integrationBenefit: 'arch.tools.jdk.benefit',
    icon: 'Terminal',
  },
  {
    id: 'ssl-https',
    tier: 'application',
    name: 'SSL / HTTPS',
    roleTitle: 'arch.tools.sslHttps.role',
    description: 'arch.tools.sslHttps.desc',
    integrationBenefit: 'arch.tools.sslHttps.benefit',
    relatedGuideTitle: 'arch.guides.ordsApex',
    icon: 'Lock',
  },
  {
    id: 'oracle-db',
    tier: 'database',
    name: 'Oracle Database 21c',
    roleTitle: 'arch.tools.oracleDb.role',
    description: 'arch.tools.oracleDb.desc',
    integrationBenefit: 'arch.tools.oracleDb.benefit',
    relatedGuideTitle: 'arch.guides.database',
    serviceKey: 'databaseStatus',
    icon: 'Database',
  },
  {
    id: 'oracle-linux',
    tier: 'database',
    name: 'Oracle Linux 8.9',
    roleTitle: 'arch.tools.oracleLinux.role',
    description: 'arch.tools.oracleLinux.desc',
    integrationBenefit: 'arch.tools.oracleLinux.benefit',
    relatedGuideTitle: 'arch.guides.linux',
    icon: 'Terminal',
  },
];

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 1,
    title: 'arch.journey.step1.title',
    description: 'arch.journey.step1.desc',
    highlightTier: 'client',
    highlightToolIds: ['web-browser', 'java-jre'],
  },
  {
    id: 2,
    title: 'arch.journey.step2.title',
    description: 'arch.journey.step2.desc',
    highlightTier: 'application',
    highlightToolIds: ['weblogic', 'ssl-https'],
  },
  {
    id: 3,
    title: 'arch.journey.step3.title',
    description: 'arch.journey.step3.desc',
    highlightTier: 'application',
    highlightToolIds: ['forms-reports', 'reports-servers'],
  },
  {
    id: 4,
    title: 'arch.journey.step4.title',
    description: 'arch.journey.step4.desc',
    highlightTier: 'database',
    highlightToolIds: ['oracle-db', 'reports-servers'],
  },
  {
    id: 5,
    title: 'arch.journey.step5.title',
    description: 'arch.journey.step5.desc',
    highlightTier: 'client',
    highlightToolIds: ['pos-terminal'],
  },
];

export const ARCHITECTURE_GUIDES: GuideCard[] = [
  { id: 'linux', title: 'arch.guides.linux', description: 'arch.guides.linux.desc', href: '/docs/OracleLinux_8.9_Install_Guide_UltimateSolutions.pdf' },
  { id: 'database', title: 'arch.guides.database', description: 'arch.guides.database.desc', href: '/docs/Oracle21c_Install_Guide_UltimateSolutions.pdf' },
  { id: 'ordsApex', title: 'arch.guides.ordsApex', description: 'arch.guides.ordsApex.desc', href: '/docs/ORDS_APEX_SSL_Guide_UltimateSolutions.pdf' },
  { id: 'appServer', title: 'arch.guides.appServer', description: 'arch.guides.appServer.desc', href: '/docs/AppServer_Browsers_Guide_UltimateSolutions.pdf' },
  { id: 'formsPatch', title: 'arch.guides.formsPatch', description: 'arch.guides.formsPatch.desc', href: '/docs/Forms_Patch_17301874_Guide_UltimateSolutions.pdf' },
  { id: 'pos', title: 'arch.guides.pos', description: 'arch.guides.pos.desc', href: '/docs/POS_Server_Guide_UltimateSolutions.pdf' },
];

export const TIER_ORDER: Array<'client' | 'application' | 'database'> = [
  'client',
  'application',
  'database',
];

export const TIER_COLORS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  client: { border: 'border-green-500/40', bg: 'bg-green-500/5', text: 'text-green-400', dot: 'bg-green-500' },
  application: { border: 'border-blue-500/40', bg: 'bg-blue-500/5', text: 'text-blue-400', dot: 'bg-blue-500' },
  database: { border: 'border-red-500/40', bg: 'bg-red-500/5', text: 'text-red-400', dot: 'bg-red-500' },
};

export const CONNECTIONS = [
  {
    from: 'client',
    to: 'application',
    protocol: 'HTTP/HTTPS',
    port: '8888 / 443',
    protocolKey: 'arch.connection.http',
  },
  {
    from: 'application',
    to: 'database',
    protocol: 'SQL*Net / TNS',
    port: '1521',
    protocolKey: 'arch.connection.tns',
  },
];

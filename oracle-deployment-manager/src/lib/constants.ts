export const ORACLE_CONFIG_FILES = [
  'tnsnames.ora',
  'formsweb.cfg',
  'default.env',
  'webutil.cfg',
  'registry.dat',
  'rwservlet.properties',
  'uifont.ali',
  'webutil.pll',
  'frmwebutil.jar',
  'fmrwebar.res',
  'sqlnet.ora',
  'listener.ora',
  'login.sql',
  'oracle_env.sh',
  'ORACLEW.env',
  'ONYXW.env',
  'ONYXWPOS.env',
  'ONYXW_EN.env',
];

export const DEPLOY_VARIABLES = [
  { key: 'HOST', label: 'Host', placeholder: 'e.g. 192.168.1.100' },
  { key: 'PORT', label: 'Port', placeholder: 'e.g. 1521' },
  { key: 'SERVICE_NAME', label: 'Service Name', placeholder: 'e.g. ORCL' },
  { key: 'FORMS_PATH', label: 'Forms Path', placeholder: 'e.g. D:\\oracle\\forms' },
  { key: 'REPORTS_PATH', label: 'Reports Path', placeholder: 'e.g. D:\\oracle\\reports' },
  { key: 'JAVA_HOME', label: 'Java Home', placeholder: 'e.g. C:\\Program Files\\Java\\jdk-17' },
  { key: 'DOMAIN_HOME', label: 'Domain Home', placeholder: 'e.g. D:\\oracle\\user_projects\\domains\\base_domain' },
  { key: 'INSTANCE_HOME', label: 'Instance Home', placeholder: 'e.g. D:\\oracle\\user_projects\\instances\\instance1' },
  { key: 'DATABASE_NAME', label: 'Database Name', placeholder: 'e.g. ORCL' },
  { key: 'TNS_ADMIN', label: 'TNS Admin', placeholder: 'e.g. D:\\oracle\\network\\admin' },
  { key: 'FORMS_LISTENER_PORT', label: 'Forms Listener Port', placeholder: 'e.g. 9001' },
  { key: 'REPORTS_LISTENER_PORT', label: 'Reports Listener Port', placeholder: 'e.g. 9002' },
];

export const DEPLOY_STEPS = [
  { id: 'backup', name: 'Backup Current Files', nameAr: 'النسخ الاحتياطي للملفات الحالية' },
  { id: 'copy', name: 'Copy New Files', nameAr: 'نسخ الملفات الجديدة' },
  { id: 'variables', name: 'Replace Variables', nameAr: 'استبدال المتغيرات' },
  { id: 'environment', name: 'Environment Configuration', nameAr: 'تكوين البيئة' },
  { id: 'webutil', name: 'WebUtil Installation', nameAr: 'تثبيت WebUtil' },
  { id: 'jar', name: 'Jar Installation', nameAr: 'تثبيت ملفات Java' },
  { id: 'restart', name: 'Restart Services', nameAr: 'إعادة تشغيل الخدمات' },
];

export const TEMPLATE_REGIONS = [
  { id: 'saudi', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { id: 'yemen', name: 'Yemen', nameAr: 'اليمن', flag: '🇾🇪' },
  { id: 'oman', name: 'Oman', nameAr: 'عُمان', flag: '🇴🇲' },
  { id: 'qatar', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { id: 'uae', name: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪' },
];

export const SERVICES = [
  { id: 'node-manager', name: 'Node Manager', nameAr: 'مدير العقد' },
  { id: 'forms', name: 'Oracle Forms', nameAr: 'أوراكل فورمز' },
  { id: 'reports', name: 'Oracle Reports', nameAr: 'أوراكل ريبورتس' },
  { id: 'weblogic', name: 'WebLogic Server', nameAr: 'خادم ويب لوجيك' },
  { id: 'windows-service', name: 'Windows Service', nameAr: 'خدمة ويندوز' },
];

export const FILE_EXTENSIONS: Record<string, string> = {
  '.ora': 'Oracle Config',
  '.cfg': 'Configuration',
  '.env': 'Environment',
  '.pll': 'Oracle PLL',
  '.pld': 'Oracle PLD',
  '.fmb': 'Oracle Forms',
  '.fmx': 'Oracle Forms Executable',
  '.rdf': 'Oracle Reports',
  '.rex': 'Oracle Reports Executable',
  '.jar': 'Java Archive',
  '.dll': 'Dynamic Link Library',
  '.res': 'Resource File',
  '.xml': 'XML File',
  '.properties': 'Properties File',
  '.dat': 'Data File',
  '.sql': 'SQL Script',
  '.bat': 'Batch File',
  '.sh': 'Shell Script',
  '.txt': 'Text File',
  '.log': 'Log File',
  '.html': 'HTML File',
  '.htm': 'HTML File',
  '.css': 'CSS File',
  '.js': 'JavaScript File',
  '.json': 'JSON File',
};

export const IX_INSTALL_PATH = 'C:\\Oracle';

// From mkdir_1010.bat — all directories to create (relative to selected disk)
export const IX_MKDIR_PATHS = [
  'ultimate\\onyxw\\fmx',
  'ultimate\\onyxw\\lib',
  'ultimate\\onyxw\\othr\\bk',
  'ultimate\\onyxw\\othr\\erp_Rprt_cch',
  'ultimate\\onyxw\\othr\\erp_Rprt_tmp',
  'ultimate\\onyxw\\othr\\usr_imgs',
  'ultimate\\onyxw\\othr\\usr_rprts',
  'ultimate\\onyxw\\othr\\wrk_area',
  'ultimate\\onyxw\\rprt',
  'oracle\\ofm\\ofr',
  'oracle\\java\\jdk7',
  'oracle\\dbs\\db1\\product\\21.3.0.0\\db_1',
];

// From install.bat — ren operations (backup originals before copy)
export const IX_REN_OPERATIONS: { src: string; destDir: string; destFile: string }[] = [
  { src: 'oracle\\ofm\\ofr\\asinst1\\config\\tnsnames.ora', destDir: 'oracle\\ofm\\ofr\\asinst1\\config', destFile: 'tnsnames.ora' },
  { src: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config\\formsweb.cfg', destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', destFile: 'formsweb.cfg' },
  { src: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config\\forms\\registry\\oracle\\forms\\registry\\registry.dat', destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config\\forms\\registry\\oracle\\forms\\registry', destFile: 'registry.dat' },
  { src: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config\\default.env', destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', destFile: 'default.env' },
  { src: 'oracle\\ofm\\ofr\\as1\\forms\\webutil', destDir: 'oracle\\ofm\\ofr\\as1\\forms', destFile: 'webutil' },
  { src: 'oracle\\ofm\\ofr\\as1\\forms\\fmrwebar.res', destDir: 'oracle\\ofm\\ofr\\as1\\forms', destFile: 'fmrwebar.res' },
  { src: 'oracle\\ofm\\ofr\\asinst1\\config\\FormsComponent\\forms\\server\\webutil.cfg', destDir: 'oracle\\ofm\\ofr\\asinst1\\config\\FormsComponent\\forms\\server', destFile: 'webutil.cfg' },
  { src: 'oracle\\ofm\\ofr\\as1\\forms\\java\\frmwebutil.jar', destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', destFile: 'frmwebutil.jar' },
  { src: 'oracle\\ofm\\ofr\\asinst1\\config\\FRComponent\\frcommon\\tools\\COMMON\\uifont.ali', destDir: 'oracle\\ofm\\ofr\\asinst1\\config\\FRComponent\\frcommon\\tools\\COMMON', destFile: 'uifont.ali' },
  { src: 'oracle\\ofm\\ofr\\as1\\forms\\webutil.pll', destDir: 'oracle\\ofm\\ofr\\as1\\forms', destFile: 'webutil.pll' },
  { src: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_REPORTS\\applications\\reports_11.1.2\\configuration\\rwservlet.properties', destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_REPORTS\\applications\\reports_11.1.2\\configuration', destFile: 'rwservlet.properties' },
];

// From install.bat — xcopy operations (source → destination)
// Source prefix: E:\sw\cfg\  →  Destination prefix: {selectedDisk}:\oracle\...
export const IX_COPY_OPERATIONS: { srcFile: string; destDir: string; description: string; descriptionAr: string }[] = [
  // Config files
  { srcFile: 'rwservlet.properties',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_REPORTS\\applications\\reports_11.1.2\\configuration', description: 'Reports servlet config', descriptionAr: 'إعدادات reports servlet' },
  { srcFile: 'uifont.ali',   destDir: 'oracle\\ofm\\ofr\\asinst1\\config\\FRComponent\\frcommon\\tools\\COMMON', description: 'UI font config', descriptionAr: 'إعدادات خطوط UI' },
  { srcFile: 'tnsnames.ora',   destDir: 'oracle\\ofm\\ofr\\asinst1\\config', description: 'TNS names config', descriptionAr: 'إعدادات TNS names' },
  { srcFile: 'formsweb.cfg',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', description: 'Forms web config', descriptionAr: 'إعدادات Forms web' },
  { srcFile: 'Registry.dat',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config\\forms\\registry\\oracle\\forms\\registry', description: 'Forms registry', descriptionAr: 'سجل Forms' },
  // WebUtil DLLs
  { srcFile: 'webutil\\win32\\d2kwut60.dll',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\webutil\\win32', description: 'WebUtil d2kwut60.dll', descriptionAr: 'ملف d2kwut60.dll' },
  { srcFile: 'webutil\\win32\\ffisamp.dll',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\webutil\\win32', description: 'WebUtil ffisamp.dll', descriptionAr: 'ملف ffisamp.dll' },
  { srcFile: 'webutil\\win32\\jacob.dll',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\webutil\\win32', description: 'WebUtil jacob.dll', descriptionAr: 'ملف jacob.dll' },
  { srcFile: 'webutil\\win32\\jacob-1.14.3-x86.dll',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\webutil\\win32', description: 'WebUtil jacob x86', descriptionAr: 'ملف jacob x86' },
  { srcFile: 'webutil\\win32\\JNIsharedstubs.dll',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\webutil\\win32', description: 'WebUtil JNIsharedstubs', descriptionAr: 'ملف JNIsharedstubs' },
  { srcFile: 'webutil\\win32\\YSBiometric.dll',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\webutil\\win32', description: 'WebUtil YSBiometric', descriptionAr: 'ملف YSBiometric' },
  // fmrwebar.res
  { srcFile: 'fmrwebar.res',   destDir: 'oracle\\ofm\\ofr\\as1\\forms', description: 'Forms resource file', descriptionAr: 'ملف موارد Forms' },
  // webutil.cfg
  { srcFile: 'webutil.cfg',   destDir: 'oracle\\ofm\\ofr\\asinst1\\config\\FormsComponent\\forms\\server', description: 'WebUtil config', descriptionAr: 'إعدادات WebUtil' },
  // JAR files
  { srcFile: 'jarfiles\\accordion.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: accordion', descriptionAr: 'ملف accordion.jar' },
  { srcFile: 'jarfiles\\archivesicons.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: archivesicons', descriptionAr: 'ملف archivesicons.jar' },
  { srcFile: 'jarfiles\\arcicons.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: arcicons', descriptionAr: 'ملف arcicons.jar' },
  { srcFile: 'jarfiles\\Calculator.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: Calculator', descriptionAr: 'ملف Calculator.jar' },
  { srcFile: 'jarfiles\\calendar.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: calendar', descriptionAr: 'ملف calendar.jar' },
  { srcFile: 'jarfiles\\clientprint.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: clientprint', descriptionAr: 'ملف clientprint.jar' },
  { srcFile: 'jarfiles\\colorpicker.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: colorpicker', descriptionAr: 'ملف colorpicker.jar' },
  { srcFile: 'jarfiles\\ComboMenuBar.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: ComboMenuBar', descriptionAr: 'ملف ComboMenuBar.jar' },
  { srcFile: 'jarfiles\\commons-logging-1.1.3.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: commons-logging', descriptionAr: 'ملف commons-logging.jar' },
  { srcFile: 'jarfiles\\FormsGraph.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: FormsGraph', descriptionAr: 'ملف FormsGraph.jar' },
  { srcFile: 'jarfiles\\frmwebutil.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: frmwebutil', descriptionAr: 'ملف frmwebutil.jar' },
  { srcFile: 'jarfiles\\gmap.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: gmap', descriptionAr: 'ملف gmap.jar' },
  { srcFile: 'jarfiles\\jacob.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: jacob', descriptionAr: 'ملف jacob.jar' },
  { srcFile: 'jarfiles\\java.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: java', descriptionAr: 'ملف java.jar' },
  { srcFile: 'jarfiles\\jcalendar.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: jcalendar', descriptionAr: 'ملف jcalendar.jar' },
  { srcFile: 'jarfiles\\JCalendarJinit.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: JCalendarJinit', descriptionAr: 'ملف JCalendarJinit.jar' },
  { srcFile: 'jarfiles\\JErpIcon.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: JErpIcon', descriptionAr: 'ملف JErpIcon.jar' },
  { srcFile: 'jarfiles\\JErpIcon-old2.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: JErpIcon-old2', descriptionAr: 'ملف JErpIcon-old2.jar' },
  { srcFile: 'jarfiles\\jicons.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: jicons', descriptionAr: 'ملف jicons.jar' },
  { srcFile: 'jarfiles\\SystemTray.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: SystemTray', descriptionAr: 'ملف SystemTray.jar' },
  { srcFile: 'jarfiles\\YSArcUtl.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: YSArcUtl', descriptionAr: 'ملف YSArcUtl.jar' },
  { srcFile: 'jarfiles\\ystools.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: ystools', descriptionAr: 'ملف ystools.jar' },
  { srcFile: 'jarfiles\\onyxix_pos.jar',   destDir: 'oracle\\ofm\\ofr\\as1\\forms\\java', description: 'JAR: onyxix_pos', descriptionAr: 'ملف onyxix_pos.jar' },
  // Env files
  { srcFile: 'default.env',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', description: 'Env: default.env', descriptionAr: 'بيئة default.env' },
  { srcFile: 'ONYXW_EN.env',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', description: 'Env: ONYXW_EN.env', descriptionAr: 'بيئة ONYXW_EN.env' },
  { srcFile: 'ONYXW.env',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', description: 'Env: ONYXW.env', descriptionAr: 'بيئة ONYXW.env' },
  { srcFile: 'ONYXWPOS.env',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', description: 'Env: ONYXWPOS.env', descriptionAr: 'بيئة ONYXWPOS.env' },
  { srcFile: 'ONYXWPOSMN.env',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', description: 'Env: ONYXWPOSMN.env', descriptionAr: 'بيئة ONYXWPOSMN.env' },
  { srcFile: 'ONYXWPOSOFF.env',   destDir: 'oracle\\ofm\\ofr\\user_projects\\domains\\ultimate\\config\\fmwconfig\\servers\\WLS_FORMS\\applications\\formsapp_11.1.2\\config', description: 'Env: ONYXWPOSOFF.env', descriptionAr: 'بيئة ONYXWPOSOFF.env' },
];

// Source root on server (where the installation media lives)
export const IX_SOURCE_ROOT = 'C:\\Users\\MOHAMMED\\Desktop\\IX-TOOLS\\SW\\cfg';

// Actual bat files
export const IX_MKDIR_BAT = 'C:\\Users\\MOHAMMED\\Desktop\\IX-TOOLS\\SW\\mkdir_1010.bat';
export const IX_INSTALL_BAT = 'C:\\Users\\MOHAMMED\\Desktop\\IX-TOOLS\\SW\\install.bat';

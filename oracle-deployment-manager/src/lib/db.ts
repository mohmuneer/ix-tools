import { randomUUID } from 'crypto';
import { hashPassword, verifyPassword } from './auth';

interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface Profile {
  id: string;
  name: string;
  description: string;
  customer_name: string;
  settings: string;
  created_at: string;
  updated_at: string;
}

interface Template {
  id: string;
  name: string;
  region: string;
  description: string;
  settings: string;
  created_at: string;
}

interface Job {
  id: string;
  profile_id: string;
  profile_name: string;
  status: string;
  steps: string;
  started_at: string;
  completed_at: string | null;
  log_entries: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  details: string;
  source: string;
}

interface Backup {
  id: string;
  file_name: string;
  original_path: string;
  backup_path: string;
  created_at: string;
  profile_id: string | null;
  job_id: string | null;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: number;
}

interface TemplateFile {
  id: string;
  template_id: string;
  name: string;
  path: string;
  size: number;
  extension: string;
  uploaded_at: string;
}

class MemoryDatabase {
  users: User[] = [];
  profiles: Profile[] = [];
  templates: Template[] = [];
  jobs: Job[] = [];
  logs: LogEntry[] = [];
  backups: Backup[] = [];
  notifications: Notification[] = [];
  templateFiles: TemplateFile[] = [];

  prepare(sql: string) {
    const self = this;
    return {
      get(...params: any[]) {
        return self._executeGet(sql, params);
      },
      all(...params: any[]) {
        return self._executeAll(sql, params);
      },
      run(...params: any[]) {
        return self._executeRun(sql, params);
      },
    };
  }

  exec(sql: string) {
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      if (stmt.toUpperCase().startsWith('CREATE TABLE')) continue;
      if (stmt.toUpperCase().startsWith('PRAGMA')) continue;
      if (stmt.toUpperCase().startsWith('ALTER TABLE')) continue;
      if (stmt.toUpperCase().startsWith('CREATE UNIQUE INDEX')) continue;
    }
  }

  pragma(_cmd: string) {}

  _executeGet(sql: string, params: any[]): any {
    const upper = sql.toUpperCase().trim();

    if (upper.includes('FROM USERS WHERE ROLE') && upper.includes('ADMIN')) {
      return this.users.find(u => u.role === 'admin') || undefined;
    }

    if (upper.includes('FROM USERS WHERE USERNAME') || upper.includes('FROM USERS WHERE EMAIL')) {
      return this.users.find(u => {
        if (params[0] && u.username === params[0]) return true;
        if (params[1] && u.email === params[1]) return true;
        if (params[0] && u.email === params[0]) return true;
        return false;
      }) || undefined;
    }

    if (upper.includes('FROM USERS WHERE ID')) {
      return this.users.find(u => u.id === params[0]) || undefined;
    }

    if (upper.includes('PRAGMA TABLE_INFO(USERS)')) {
      return [
        { name: 'id' }, { name: 'email' }, { name: 'username' },
        { name: 'password_hash' }, { name: 'role' }, { name: 'status' },
        { name: 'created_at' }, { name: 'reviewed_at' }, { name: 'reviewed_by' },
      ];
    }

    if (upper.includes('FROM PROFILES WHERE ID')) {
      return this.profiles.find(p => p.id === params[0]) || undefined;
    }
    if (upper.includes('FROM TEMPLATES WHERE ID')) {
      return this.templates.find(t => t.id === params[0]) || undefined;
    }
    if (upper.includes('FROM JOBS WHERE ID')) {
      return this.jobs.find(j => j.id === params[0]) || undefined;
    }

    if (upper.includes('COUNT(*)')) {
      if (upper.includes('FROM USERS')) return { 'count(*)': this.users.length };
      if (upper.includes('FROM PROFILES')) return { 'count(*)': this.profiles.length };
      if (upper.includes('FROM TEMPLATES')) return { 'count(*)': this.templates.length };
      if (upper.includes('FROM JOBS')) return { 'count(*)': this.jobs.length };
      if (upper.includes('FROM NOTIFICATIONS')) return { 'count(*)': this.notifications.length };
    }

    return undefined;
  }

  _executeAll(sql: string, params: any[]): any[] {
    const upper = sql.toUpperCase().trim();

    if (upper.includes('FROM USERS') && !upper.includes('COUNT')) {
      let results = [...this.users];
      if (upper.includes('WHERE STATUS')) {
        const status = params.find((p: any) => ['pending', 'active', 'rejected'].includes(p));
        if (status) results = results.filter(u => u.status === status);
      }
      if (upper.includes('ORDER BY')) {
        if (upper.includes('CREATED_AT DESC')) {
          results.sort((a, b) => b.created_at.localeCompare(a.created_at));
        }
      }
      return results;
    }

    if (upper.includes('FROM PROFILES')) return [...this.profiles];
    if (upper.includes('FROM TEMPLATES') && upper.includes('TEMPLATE_FILES')) return [...this.templateFiles];
    if (upper.includes('FROM TEMPLATES')) return [...this.templates];
    if (upper.includes('FROM JOBS')) return [...this.jobs];
    if (upper.includes('FROM LOGS')) {
      let results = [...this.logs];
      results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      return results;
    }
    if (upper.includes('FROM BACKUPS')) return [...this.backups];
    if (upper.includes('FROM NOTIFICATIONS')) return [...this.notifications];
    if (upper.includes('FROM TEMPLATE_FILES')) return [...this.templateFiles];

    return [];
  }

  _executeRun(sql: string, params: any[]): any {
    const upper = sql.toUpperCase().trim();

    if (upper.startsWith('INSERT INTO USERS')) {
      const user: User = {
        id: params[0] || randomUUID(),
        email: params[1] || '',
        username: params[2] || '',
        password_hash: params[3] || '',
        role: params[4] || 'user',
        status: params[5] || 'active',
        created_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
      };
      this.users.push(user);
      return { changes: 1 };
    }

    if (upper.startsWith('INSERT INTO PROFILES')) {
      this.profiles.push({
        id: params[0], name: params[1], description: params[2] || '',
        customer_name: params[3] || '', settings: params[4] || '{}',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      return { changes: 1 };
    }

    if (upper.startsWith('INSERT INTO TEMPLATES')) {
      this.templates.push({
        id: params[0], name: params[1], region: params[2] || '',
        description: params[3] || '', settings: params[4] || '{}',
        created_at: new Date().toISOString(),
      });
      return { changes: 1 };
    }

    if (upper.startsWith('INSERT INTO JOBS')) {
      this.jobs.push({
        id: params[0], profile_id: params[1] || '', profile_name: params[2] || '',
        status: params[3] || 'pending', steps: params[4] || '[]',
        started_at: new Date().toISOString(), completed_at: null, log_entries: params[5] || '[]',
      });
      return { changes: 1 };
    }

    if (upper.startsWith('INSERT INTO LOGS')) {
      this.logs.push({
        id: params[0] || randomUUID(), timestamp: new Date().toISOString(),
        level: params[1] || 'info', message: params[2] || '',
        details: params[3] || '', source: params[4] || '',
      });
      return { changes: 1 };
    }

    if (upper.startsWith('INSERT INTO NOTIFICATIONS')) {
      this.notifications.push({
        id: params[0] || randomUUID(), type: params[1] || 'info',
        title: params[2] || '', message: params[3] || '',
        timestamp: new Date().toISOString(), read: 0,
      });
      return { changes: 1 };
    }

    if (upper.startsWith('INSERT INTO BACKUPS')) {
      this.backups.push({
        id: params[0], file_name: params[1], original_path: params[2],
        backup_path: params[3], created_at: new Date().toISOString(),
        profile_id: params[4] || null, job_id: params[5] || null,
      });
      return { changes: 1 };
    }

    if (upper.startsWith('INSERT INTO TEMPLATE_FILES')) {
      this.templateFiles.push({
        id: params[0], template_id: params[1], name: params[2],
        path: params[3], size: params[4] || 0, extension: params[5] || '',
        uploaded_at: new Date().toISOString(),
      });
      return { changes: 1 };
    }

    if (upper.startsWith('UPDATE USERS')) {
      let changes = 0;
      if (upper.includes('SET PASSWORD_HASH')) {
        const user = this.users.find(u => u.id === params[0]);
        if (user) { user.password_hash = params[1]; changes++; }
      }
      if (upper.includes('SET STATUS') && upper.includes('WHERE ID')) {
        const user = this.users.find(u => u.id === params[0]);
        if (user) { user.status = params[1]; changes++; }
      }
      if (upper.includes('SET STATUS') && upper.includes('REVIEWED')) {
        this.users.forEach(u => {
          if (u.status === '' || u.status === null as any) {
            u.status = 'active';
            changes++;
          }
        });
      }
      if (upper.includes('EMAIL = USERNAME')) {
        this.users.forEach(u => {
          if (!u.email && u.role === 'admin') {
            u.email = u.username + '@admin.local';
            changes++;
          }
        });
      }
      return { changes };
    }

    if (upper.startsWith('UPDATE PROFILES')) {
      const profile = this.profiles.find(p => p.id === params[params.length - 1]);
      if (profile) {
        if (upper.includes('SET NAME')) profile.name = params[0];
        if (upper.includes('SET DESCRIPTION')) profile.description = params[1];
        profile.updated_at = new Date().toISOString();
      }
      return { changes: profile ? 1 : 0 };
    }

    if (upper.startsWith('UPDATE JOBS')) {
      const job = this.jobs.find(j => j.id === params[params.length - 1]);
      if (job) {
        if (upper.includes('SET STATUS')) job.status = params[0];
        if (upper.includes('SET COMPLETED_AT')) job.completed_at = params[0];
        if (upper.includes('SET LOG_ENTRIES')) job.log_entries = params[0];
        if (upper.includes('SET STEPS')) job.steps = params[0];
      }
      return { changes: job ? 1 : 0 };
    }

    if (upper.startsWith('UPDATE NOTIFICATIONS')) {
      let changes = 0;
      if (upper.includes('SET READ')) {
        this.notifications.forEach(n => { n.read = 1; changes++; });
      }
      return { changes };
    }

    if (upper.startsWith('DELETE FROM')) {
      let changes = 0;
      if (upper.includes('FROM USERS WHERE ID')) {
        const idx = this.users.findIndex(u => u.id === params[0]);
        if (idx >= 0) { this.users.splice(idx, 1); changes++; }
      }
      if (upper.includes('FROM PROFILES WHERE ID')) {
        const idx = this.profiles.findIndex(p => p.id === params[0]);
        if (idx >= 0) { this.profiles.splice(idx, 1); changes++; }
      }
      if (upper.includes('FROM TEMPLATES WHERE ID')) {
        const idx = this.templates.findIndex(t => t.id === params[0]);
        if (idx >= 0) { this.templates.splice(idx, 1); changes++; }
      }
      if (upper.includes('FROM NOTIFICATIONS WHERE ID')) {
        const idx = this.notifications.findIndex(n => n.id === params[0]);
        if (idx >= 0) { this.notifications.splice(idx, 1); changes++; }
      }
      if (upper.includes('FROM TEMPLATE_FILES WHERE TEMPLATE_ID')) {
        this.templateFiles = this.templateFiles.filter(f => f.template_id !== params[0]);
        changes = 1;
      }
      return { changes };
    }

    return { changes: 0 };
  }
}

let memDb: MemoryDatabase | null = null;

function getMemDb(): MemoryDatabase {
  if (!memDb) {
    memDb = new MemoryDatabase();
    seedAdmin(memDb);
  }
  return memDb;
}

function seedAdmin(database: MemoryDatabase) {
  const existing = database.users.find(u => u.role === 'admin');
  if (!existing) {
    database.users.push({
      id: randomUUID(),
      email: 'admin@onyx.ix',
      username: 'admin',
      password_hash: hashPassword('admin123'),
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    });
  }
}

let sqliteDb: any = null;
let useSqlite = false;
let sqliteChecked = false;

export function getDb(): any {
  if (!sqliteChecked) {
    sqliteChecked = true;
    try {
      const Database = require('better-sqlite3');
      const path = require('path');
      const { mkdirSync, accessSync, constants } = require('fs');

      const DATA_DIR = path.join(process.cwd(), 'data');
      try {
        mkdirSync(DATA_DIR, { recursive: true });
        accessSync(DATA_DIR, constants.W_OK);
        sqliteDb = new Database(path.join(DATA_DIR, 'oracle-deploy.db'));
        sqliteDb.pragma('journal_mode = WAL');
        initSqliteDb(sqliteDb);
        seedSqliteAdmin(sqliteDb);
        useSqlite = true;
      } catch {
        useSqlite = false;
      }
    } catch {
      useSqlite = false;
    }
  }

  if (useSqlite && sqliteDb) {
    return sqliteDb;
  }

  return getMemDb();
}

function initSqliteDb(database: any) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '',
      customer_name TEXT DEFAULT '', settings TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, region TEXT DEFAULT '',
      description TEXT DEFAULT '', settings TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, profile_id TEXT, profile_name TEXT DEFAULT '',
      status TEXT DEFAULT 'pending', steps TEXT DEFAULT '[]',
      started_at TEXT DEFAULT (datetime('now')), completed_at TEXT,
      log_entries TEXT DEFAULT '[]',
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY, timestamp TEXT DEFAULT (datetime('now')),
      level TEXT DEFAULT 'info', message TEXT NOT NULL,
      details TEXT DEFAULT '', source TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY, file_name TEXT NOT NULL, original_path TEXT NOT NULL,
      backup_path TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')),
      profile_id TEXT, job_id TEXT
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, type TEXT DEFAULT 'info', title TEXT NOT NULL,
      message TEXT DEFAULT '', timestamp TEXT DEFAULT (datetime('now')),
      read INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, username TEXT NOT NULL,
      password_hash TEXT NOT NULL, role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'rejected')),
      created_at TEXT DEFAULT (datetime('now')), reviewed_at TEXT, reviewed_by TEXT
    );
    CREATE TABLE IF NOT EXISTS template_files (
      id TEXT PRIMARY KEY, template_id TEXT NOT NULL, name TEXT NOT NULL,
      path TEXT NOT NULL, size INTEGER DEFAULT 0, extension TEXT DEFAULT '',
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );
  `);

  const columns = database.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const colNames = new Set(columns.map((c: any) => c.name));
  if (!colNames.has('email')) { database.exec("ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT ''"); database.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)"); }
  if (!colNames.has('status')) database.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
  if (!colNames.has('reviewed_at')) database.exec("ALTER TABLE users ADD COLUMN reviewed_at TEXT");
  if (!colNames.has('reviewed_by')) database.exec("ALTER TABLE users ADD COLUMN reviewed_by TEXT");
  if (!colNames.has('username')) database.exec("ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''");
  database.exec("UPDATE users SET email = username || '@admin.local' WHERE email = '' AND role = 'admin'");
  database.exec("UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''");
}

function seedSqliteAdmin(database: any) {
  const existing = database.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (!existing) {
    const { randomUUID: uuid } = require('crypto');
    const { hashPassword: hp } = require('./auth');
    database.prepare(
      "INSERT INTO users (id, email, username, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(uuid(), 'admin@onyx.ix', 'admin', hp('admin123'), 'admin', 'active');
  }
}

export function dbToJSON<T>(value: string): T {
  try { return JSON.parse(value) as T; } catch { return {} as T; }
}

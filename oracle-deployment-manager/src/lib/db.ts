import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { hashPassword } from './auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'oracle-deploy.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    mkdirSync(DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb();
    seedAdmin();
  }
  return db;
}

function seedAdmin() {
  const database = db!;
  const existing = database.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (!existing) {
    const id = randomUUID();
    const passwordHash = hashPassword('admin123');
    database.prepare(
      "INSERT INTO users (id, email, username, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, 'admin@onyx.ix', 'admin', passwordHash, 'admin', 'active');
  }
}

function initDb() {
  const database = db!;

  database.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      customer_name TEXT DEFAULT '',
      settings TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT DEFAULT '',
      description TEXT DEFAULT '',
      settings TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      profile_id TEXT,
      profile_name TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      steps TEXT DEFAULT '[]',
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      log_entries TEXT DEFAULT '[]',
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT (datetime('now')),
      level TEXT DEFAULT 'info',
      message TEXT NOT NULL,
      details TEXT DEFAULT '',
      source TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      original_path TEXT NOT NULL,
      backup_path TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      profile_id TEXT,
      job_id TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT DEFAULT 'info',
      title TEXT NOT NULL,
      message TEXT DEFAULT '',
      timestamp TEXT DEFAULT (datetime('now')),
      read INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'rejected')),
      created_at TEXT DEFAULT (datetime('now')),
      reviewed_at TEXT,
      reviewed_by TEXT
    );

    CREATE TABLE IF NOT EXISTS template_files (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER DEFAULT 0,
      extension TEXT DEFAULT '',
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );
  `);

  migrateUsersTable(database);
}

function migrateUsersTable(database: Database.Database) {
  const columns = database.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const colNames = new Set(columns.map((c) => c.name));

  if (!colNames.has('email')) {
    database.exec("ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT ''");
    database.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)");
  }
  if (!colNames.has('status')) {
    database.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
  }
  if (!colNames.has('reviewed_at')) {
    database.exec("ALTER TABLE users ADD COLUMN reviewed_at TEXT");
  }
  if (!colNames.has('reviewed_by')) {
    database.exec("ALTER TABLE users ADD COLUMN reviewed_by TEXT");
  }
  if (!colNames.has('username')) {
    database.exec("ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''");
  }

  database.exec("UPDATE users SET email = username || '@admin.local' WHERE email = '' AND role = 'admin'");
  database.exec("UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''");
}

export function dbToJSON<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
}

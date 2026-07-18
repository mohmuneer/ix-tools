import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'oracle-deploy.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb();
  }
  return db;
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
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      created_at TEXT DEFAULT (datetime('now'))
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
}

export function dbToJSON<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
}

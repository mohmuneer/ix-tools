import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbToJSON } from '@/lib/db';
import { FileEngine } from '@/lib/file-engine';
import type { BackupEntry } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM backups ORDER BY created_at DESC').all() as any[];
    const backups: BackupEntry[] = rows.map((row) => ({
      id: row.id,
      fileName: row.file_name,
      originalPath: row.original_path,
      backupPath: row.backup_path,
      createdAt: row.created_at,
      profileId: row.profile_id,
      jobId: row.job_id,
    }));
    return NextResponse.json({ backups });
  } catch (error: any) {
    return NextResponse.json({ backups: [], error: error.message });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    if (body.action === 'restore') {
      const db = getDb();
      const row = db.prepare('SELECT * FROM backups WHERE id = ?').get(body.backupId) as any;
      if (!row) {
        return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
      }

      const backupExists = await FileEngine.exists(row.backup_path);
      if (!backupExists) {
        return NextResponse.json({ error: 'Backup file not found on disk' }, { status: 404 });
      }

      await FileEngine.restoreFile(row.backup_path, row.original_path);

      db.prepare(
        'INSERT INTO logs (id, level, message, source) VALUES (?, ?, ?, ?)'
      ).run(crypto.randomUUID(), 'success', `Restored ${row.file_name} from backup`, 'Rollback');

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

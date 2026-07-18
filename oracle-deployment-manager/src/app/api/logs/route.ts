import { NextResponse } from 'next/server';
import { getDb, dbToJSON } from '@/lib/db';
import type { LogEntry } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 500').all() as any[];
    const logs: LogEntry[] = rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      level: row.level,
      message: row.message,
      details: row.details,
      source: row.source,
    }));
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ logs: [], error: error.message });
  }
}

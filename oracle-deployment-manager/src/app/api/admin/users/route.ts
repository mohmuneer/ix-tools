import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = getDb();

    let query = 'SELECT id, email, username, role, status, created_at, reviewed_at, reviewed_by FROM users';
    const params: string[] = [];

    if (status && ['pending', 'active', 'rejected'].includes(status)) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const users = db.prepare(query).all(...params);

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

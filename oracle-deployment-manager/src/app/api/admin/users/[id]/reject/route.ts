import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const user = db.prepare('SELECT id, status FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.status === 'rejected') {
      return NextResponse.json({ error: 'User is already rejected' }, { status: 400 });
    }

    db.prepare(
      "UPDATE users SET status = 'rejected', reviewed_at = datetime('now') WHERE id = ?"
    ).run(id);

    return NextResponse.json({ success: true, message: 'User rejected successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

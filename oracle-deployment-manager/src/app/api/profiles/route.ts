import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbToJSON } from '@/lib/db';
import type { DeployProfile } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all() as any[];
    const profiles: DeployProfile[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      customerName: row.customer_name,
      settings: dbToJSON(row.settings),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    return NextResponse.json({ profiles });
  } catch (error: any) {
    return NextResponse.json({ profiles: [], error: error.message });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = getDb();

  try {
    switch (body.action) {
      case 'create': {
        const id = body.id || crypto.randomUUID();
        db.prepare(
          'INSERT INTO profiles (id, name, description, customer_name, settings) VALUES (?, ?, ?, ?, ?)'
        ).run(id, body.name, body.description || '', body.customerName || '', JSON.stringify(body.settings || {}));
        return NextResponse.json({ success: true, id });
      }
      case 'update': {
        db.prepare(
          'UPDATE profiles SET name = ?, description = ?, customer_name = ?, settings = ?, updated_at = datetime("now") WHERE id = ?'
        ).run(body.name, body.description || '', body.customerName || '', JSON.stringify(body.settings || {}), body.id);
        return NextResponse.json({ success: true });
      }
      case 'delete': {
        db.prepare('DELETE FROM profiles WHERE id = ?').run(body.id);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

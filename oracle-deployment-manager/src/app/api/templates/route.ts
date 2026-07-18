import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbToJSON } from '@/lib/db';
import type { Template } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all() as any[];
    const templates: Template[] = rows.map((row) => {
      const fileRows = db.prepare('SELECT * FROM template_files WHERE template_id = ? ORDER BY uploaded_at DESC').all(row.id) as any[];
      return {
        id: row.id,
        name: row.name,
        region: row.region,
        description: row.description,
        settings: dbToJSON(row.settings),
        files: fileRows.map((f: any) => ({
          id: f.id,
          templateId: f.template_id,
          name: f.name,
          path: f.path,
          size: f.size,
          extension: f.extension,
          uploadedAt: f.uploaded_at,
        })),
        createdAt: row.created_at,
      };
    });
    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ templates: [], error: error.message });
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
          'INSERT INTO templates (id, name, region, description, settings) VALUES (?, ?, ?, ?, ?)'
        ).run(id, body.name, body.region || '', body.description || '', JSON.stringify(body.settings || {}));
        return NextResponse.json({ success: true, id });
      }
      case 'update': {
        db.prepare(
          'UPDATE templates SET name = ?, region = ?, description = ?, settings = ? WHERE id = ?'
        ).run(body.name, body.region || '', body.description || '', JSON.stringify(body.settings || {}), body.id);
        return NextResponse.json({ success: true });
      }
      case 'delete': {
        db.prepare('DELETE FROM templates WHERE id = ?').run(body.id);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

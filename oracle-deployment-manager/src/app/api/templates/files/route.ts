import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbToJSON } from '@/lib/db';
import { FileEngine } from '@/lib/file-engine';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'template-files');

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
  const templateId = request.nextUrl.searchParams.get('templateId');
  if (!templateId) {
    return NextResponse.json({ error: 'templateId required' }, { status: 400 });
  }

  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM template_files WHERE template_id = ? ORDER BY uploaded_at DESC').all(templateId) as any[];
    const files = rows.map((row) => ({
      id: row.id,
      templateId: row.template_id,
      name: row.name,
      path: row.path,
      size: row.size,
      extension: row.extension,
      uploadedAt: row.uploaded_at,
    }));
    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ files: [], error: error.message });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = getDb();

  try {
    switch (body.action) {
      case 'upload': {
        await ensureUploadDir();
        const { templateId, name, content, extension } = body;
        if (!templateId || !name || content === undefined) {
          return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const id = crypto.randomUUID();
        const fileName = `${id}_${name}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        await fs.writeFile(filePath, content, 'utf-8');
        const stat = await fs.stat(filePath);
        db.prepare(
          'INSERT INTO template_files (id, template_id, name, path, size, extension) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(id, templateId, name, filePath, stat.size, extension || path.extname(name).toLowerCase());
        return NextResponse.json({
          success: true,
          file: { id, templateId, name, path: filePath, size: stat.size, extension: extension || path.extname(name).toLowerCase(), uploadedAt: new Date().toISOString() }
        });
      }

      case 'uploadFromServer': {
        const { templateId: tid, serverPath } = body;
        if (!tid || !serverPath) {
          return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const fileName = path.basename(serverPath);
        const ext = path.extname(fileName).toLowerCase();
        const id = crypto.randomUUID();
        db.prepare(
          'INSERT INTO template_files (id, template_id, name, path, size, extension) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(id, tid, fileName, serverPath, 0, ext);
        return NextResponse.json({
          success: true,
          file: { id, templateId: tid, name: fileName, path: serverPath, size: 0, extension: ext, uploadedAt: new Date().toISOString() }
        });
      }

      case 'execute': {
        const { fileId } = body;
        if (!fileId) {
          return NextResponse.json({ error: 'fileId required' }, { status: 400 });
        }
        const row = db.prepare('SELECT * FROM template_files WHERE id = ?').get(fileId) as any;
        if (!row) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const filePath = row.path;
        const ext = row.extension.toLowerCase();
        const startTime = Date.now();
        let output = '';
        let success = true;

        try {
          if (ext === '.bat' || ext === '.cmd') {
            const { execSync } = await import('child_process');
            output = execSync(`cmd /c "${filePath}"`, {
              encoding: 'utf-8',
              timeout: 120000,
              cwd: path.dirname(filePath),
            });
          } else if (ext === '.sh') {
            const { execSync } = await import('child_process');
            output = execSync(`bash "${filePath}"`, {
              encoding: 'utf-8',
              timeout: 120000,
              cwd: path.dirname(filePath),
            });
          } else if (ext === '.sql') {
            const content = await fs.readFile(filePath, 'utf-8');
            output = `[SQL Script Preview]\nFile: ${row.name}\nLines: ${content.split('\n').length}\n\nTo execute SQL, use a database connection tool.`;
          } else if (ext === '.py') {
            const { execSync } = await import('child_process');
            output = execSync(`python "${filePath}"`, {
              encoding: 'utf-8',
              timeout: 120000,
              cwd: path.dirname(filePath),
            });
          } else if (ext === '.ps1') {
            const { execSync } = await import('child_process');
            output = execSync(`powershell -ExecutionPolicy Bypass -File "${filePath}"`, {
              encoding: 'utf-8',
              timeout: 120000,
              cwd: path.dirname(filePath),
            });
          } else if (ext === '.json' || ext === '.xml' || ext === '.txt' || ext === '.log' || ext === '.properties' || ext === '.cfg' || ext === '.env' || ext === '.ora') {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const preview = lines.slice(0, 100).join('\n');
            output = `[${ext.toUpperCase()} File Content]\nFile: ${row.name}\nLines: ${lines.length}\n${lines.length > 100 ? `(showing first 100 lines)\n` : ''}\n${preview}`;
          } else {
            const content = await fs.readFile(filePath, 'utf-8');
            output = `[File Content]\nFile: ${row.name}\nSize: ${row.size}\n\n${content.slice(0, 5000)}`;
          }
        } catch (execError: any) {
          output = execError.message || 'Execution failed';
          success = false;
        }

        const duration = Date.now() - startTime;
        return NextResponse.json({
          success,
          output,
          duration,
          fileName: row.name,
        });
      }

      case 'delete': {
        const { fileId: delId } = body;
        if (!delId) {
          return NextResponse.json({ error: 'fileId required' }, { status: 400 });
        }
        const fileRow = db.prepare('SELECT * FROM template_files WHERE id = ?').get(delId) as any;
        if (fileRow) {
          try {
            await fs.unlink(fileRow.path);
          } catch {}
        }
        db.prepare('DELETE FROM template_files WHERE id = ?').run(delId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

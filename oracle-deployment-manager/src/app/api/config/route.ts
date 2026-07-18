import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { FileEngine } from '@/lib/file-engine';

const SEARCH_DIRS = [
  'C:\\oracle\\network\\admin',
  'D:\\oracle',
  'D:\\ofm',
  'C:\\Users\\MOHAMMED\\Desktop\\IX-TOOLS\\SW\\cfg',
];

async function quickSearch(dir: string, query: string, maxDepth: number = 2, currentDepth: number = 0): Promise<Array<{ name: string; path: string; size: number; modified: string; extension: string }>> {
  const results: Array<{ name: string; path: string; size: number; modified: string; extension: string }> = [];
  if (currentDepth > maxDepth) return results;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (results.length >= 30) break;
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.toLowerCase().includes(query.toLowerCase())) {
        try {
          const stat = await fs.stat(fullPath);
          results.push({ name: entry.name, path: fullPath, size: stat.size, modified: stat.mtime.toISOString(), extension: path.extname(entry.name).toLowerCase() });
        } catch {}
      } else if (entry.isDirectory() && currentDepth < maxDepth) {
        try {
          const sub = await quickSearch(fullPath, query, maxDepth, currentDepth + 1);
          results.push(...sub);
        } catch {}
      }
    }
  } catch {}
  return results;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const filePath = searchParams.get('path');
  const query = searchParams.get('query');

  try {
    if (action === 'search' && query) {
      const seen = new Set<string>();
      const allResults = (await Promise.all(SEARCH_DIRS.map((dir) => quickSearch(dir, query, 2).catch(() => [])))).flat().filter((r) => {
        if (seen.has(r.path)) return false;
        seen.add(r.path);
        return true;
      });
      return NextResponse.json({ files: allResults });
    }

    if (action === 'read' && filePath) {
      const content = await FileEngine.readFile(filePath);
      return NextResponse.json({ content });
    }

    if (action === 'browse' && filePath) {
      const files = await FileEngine.listDirectory(filePath);
      return NextResponse.json({ files });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, path: filePath, content } = body;

  try {
    if (action === 'save') {
      const backupPath = await FileEngine.backupFile(filePath);
      await FileEngine.writeFile(filePath, content);
      return NextResponse.json({ success: true, backupPath });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

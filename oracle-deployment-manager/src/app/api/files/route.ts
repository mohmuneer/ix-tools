import { NextRequest, NextResponse } from 'next/server';
import { FileEngine } from '@/lib/file-engine';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get('path');
  const action = searchParams.get('action');

  if (!filePath) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  try {
    if (action === 'read') {
      const content = await FileEngine.readFile(filePath);
      return NextResponse.json({ content });
    }
    const files = await FileEngine.listDirectory(filePath);
    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, path: filePath, name, source, destination, content } = body;

  try {
    switch (action) {
      case 'createFolder':
        await FileEngine.createDirectory(path.join(filePath, name));
        return NextResponse.json({ success: true });

      case 'createFile':
        await FileEngine.writeFile(path.join(filePath, name), '');
        return NextResponse.json({ success: true });

      case 'delete':
        await FileEngine.deleteItem(filePath);
        return NextResponse.json({ success: true });

      case 'rename':
        await FileEngine.renameItem(filePath, name);
        return NextResponse.json({ success: true });

      case 'copy':
        const destPath = path.join(destination, path.basename(source));
        await FileEngine.copyItem(source, destPath);
        return NextResponse.json({ success: true });

      case 'move':
        const moveDest = path.join(destination, path.basename(source));
        await FileEngine.moveItem(source, moveDest);
        return NextResponse.json({ success: true });

      case 'write':
        await FileEngine.writeFile(filePath, content);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

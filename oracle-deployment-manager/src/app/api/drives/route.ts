import { NextResponse } from 'next/server';
import { FileEngine } from '@/lib/file-engine';

export async function GET() {
  try {
    const drivesInfo = await FileEngine.listDrivesInfo();
    const drives = drivesInfo.map((d) => d.letter);
    return NextResponse.json({ drives, drivesInfo });
  } catch (error: any) {
    return NextResponse.json({ drives: ['C:'], drivesInfo: [{ letter: 'C:', label: 'Local Disk', freeSpace: 0, totalSpace: 0 }] });
  }
}

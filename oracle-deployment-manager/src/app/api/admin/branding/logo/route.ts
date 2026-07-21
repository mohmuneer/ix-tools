import { NextRequest, NextResponse } from 'next/server';
import { getBranding, saveBranding } from '@/lib/branding';

export async function POST(req: NextRequest) {
  try {
    const role = req.cookies.get('auth-role')?.value;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/x-icon'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPG, SVG, WebP, ICO' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const logoUrl = `data:${file.type};base64,${base64}`;

    const branding = getBranding();
    branding.logo.logoUrl = logoUrl;
    saveBranding(branding);

    return NextResponse.json({ logoUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getBranding, saveBranding, type BrandingData } from '@/lib/branding';

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

function validateColors(colors: Record<string, string>): string | null {
  for (const [key, value] of Object.entries(colors)) {
    if (!HEX_RE.test(value)) {
      return `Invalid hex color for ${key}: ${value}`;
    }
  }
  return null;
}

export async function PUT(req: NextRequest) {
  try {
    const role = req.cookies.get('auth-role')?.value;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const current = getBranding();

    const updated: BrandingData = {
      colors: { ...current.colors, ...body.colors },
      font: { ...current.font, ...body.font },
      theme: body.theme ?? current.theme,
      logo: { ...current.logo, ...body.logo },
      login: { ...current.login, ...body.login },
      updatedAt: new Date().toISOString(),
      updatedBy: req.cookies.get('auth-username')?.value ?? 'admin',
    };

    const colorError = validateColors(updated.colors);
    if (colorError) {
      return NextResponse.json({ error: colorError }, { status: 400 });
    }

    saveBranding(updated);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

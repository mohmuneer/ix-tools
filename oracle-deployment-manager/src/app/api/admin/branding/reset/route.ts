import { NextRequest, NextResponse } from 'next/server';
import { resetBranding } from '@/lib/branding';

export async function POST(req: NextRequest) {
  try {
    const role = req.cookies.get('auth-role')?.value;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const branding = resetBranding();
    return NextResponse.json(branding);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

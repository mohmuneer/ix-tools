import { NextResponse } from 'next/server';
import { getBranding } from '@/lib/branding';

export async function GET() {
  try {
    const branding = getBranding();
    return NextResponse.json(branding);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

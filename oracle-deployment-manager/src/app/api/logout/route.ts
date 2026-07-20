import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth-role', '', { path: '/', maxAge: 0 });
  response.cookies.set('auth-username', '', { path: '/', maxAge: 0 });
  response.cookies.set('auth-user-id', '', { path: '/', maxAge: 0 });
  return response;
}

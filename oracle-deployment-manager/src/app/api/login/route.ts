import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const db = getDb();

    const user = db.prepare(
      'SELECT id, email, username, password_hash, role, status FROM users WHERE username = ? OR email = ?'
    ).get(username, username) as any;

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'pending') {
      return NextResponse.json({ error: 'Your account is pending admin approval' }, { status: 403 });
    }

    if (user.status === 'rejected') {
      return NextResponse.json({ error: 'Your account has been rejected' }, { status: 403 });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });

    response.cookies.set('auth-role', user.role, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('auth-username', user.username, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('auth-user-id', user.id, { path: '/', maxAge: 60 * 60 * 24 * 7 });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, confirmPassword } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password too short (min 4 characters)' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const id = randomUUID();
    const passwordHash = hashPassword(password);

    db.prepare(
      'INSERT INTO users (id, email, username, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, email, username, passwordHash, 'user', 'pending');

    return NextResponse.json({ success: true, message: 'Registration request submitted. Awaiting admin approval.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

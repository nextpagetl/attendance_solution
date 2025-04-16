import connectDB from '../../../../lib/db';
import Admin from '../../../../models/Admin';
import bcrypt from 'bcryptjs';
import { createToken } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await connectDB();
  const { username, password } = await request.json();

  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = createToken(admin);
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
import connectDB from '../../../../lib/db';
import Admin from '../../../../models/Admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await connectDB();
  const { username, password } = await request.json();

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
    }
    const admin = new Admin({ username, password });
    await admin.save();
    return NextResponse.json({ message: 'Admin created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
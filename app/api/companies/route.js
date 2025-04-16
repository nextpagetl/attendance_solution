import connectDB from '../../../lib/db';
import Company from '../../../models/Company';
import { verifyToken } from '../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  try {
    const company = new Company({ name });
    await company.save();
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(request) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const companies = await Company.find();
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
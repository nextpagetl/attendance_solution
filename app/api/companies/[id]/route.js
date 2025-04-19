import connectDB from '../../../../lib/db';
import Company from '../../../../models/Company';
import { verifyToken } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const company = await Company.findById(params.id);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  try {
    const company = await Company.findByIdAndUpdate(
      params.id,
      { name, updatedAt: Date.now() },
      { new: true }
    );
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
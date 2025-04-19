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

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const skip = (page - 1) * limit;

  try {
    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }
    const companies = await Company.find(query).skip(skip).limit(limit);
    const total = await Company.countDocuments(query);
    return NextResponse.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
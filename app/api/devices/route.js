import connectDB from '../../../lib/db';
import Device from '../../../models/Device';
import { verifyToken } from '../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { serialNumber, companyId, apiUrl } = await request.json();
  try {
    const device = new Device({ serialNumber, companyId, apiUrl });
    await device.save();
    return NextResponse.json(device, { status: 201 });
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
  const page = searchParams.get('page') || 1;
  const limit = searchParams.get('limit') || 10;

  try {
    const devices = await Device.find()
      .populate('companyId', 'name')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const count = await Device.countDocuments();
    return NextResponse.json({
      devices,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
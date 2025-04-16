import connectDB from '../../../../lib/db';
import Device from '../../../../models/Device';
import { verifyToken } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  try {
    const devices = await Device.find({
      $or: [
        { serialNumber: { $regex: query, $options: 'i' } },
        { 'companyId.name': { $regex: query, $options: 'i' } },
      ],
    }).populate('companyId', 'name');
    return NextResponse.json(devices);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
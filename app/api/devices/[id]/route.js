import connectDB from '../../../../lib/db';
import Device from '../../../../models/Device';
import { verifyToken } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const device = await Device.findById(id).populate('companyId');
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    return NextResponse.json(device);
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
  const { id } = params;
  const { serialNumber, companyId, apiUrl, isActive } = await request.json();
  try {
    const device = await Device.findByIdAndUpdate(
      id,
      { serialNumber, companyId, apiUrl, isActive, updatedAt: Date.now() },
      { new: true }
    );
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    return NextResponse.json(device);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
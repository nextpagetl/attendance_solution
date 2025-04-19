import connectDB from '../../../lib/db';
import Device from '../../../models/Device';
import Company from '../../../models/Company';
import { verifyToken } from '../../../lib/auth';
import { NextResponse } from 'next/server';

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
      const companies = await Company.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      const companyIds = companies.map(c => c._id);
      query = {
        $or: [
          { serialNumber: { $regex: search, $options: 'i' } },
          { companyId: { $in: companyIds } }
        ]
      };
    }
    const devices = await Device.find(query)
      .populate('companyId')
      .skip(skip)
      .limit(limit);
    const total = await Device.countDocuments(query);
    return NextResponse.json({
      devices,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await connectDB();
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { serialNumber, companyId, apiUrl, isActive } = await request.json();
  if (!serialNumber || !companyId || !apiUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const device = new Device({
      serialNumber,
      companyId,
      apiUrl,
      isActive: isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await device.save();
    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
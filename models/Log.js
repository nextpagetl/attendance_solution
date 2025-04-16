import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  sn: { type: String, required: true, index: true },
  cmd: { type: String },
  ret: { type: String },
  count: { type: Number, default: 0 },
  logindex: { type: Number },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  record: [
    {
      enrollid: { type: Number },
      time: { type: String, required: true },
      mode: { type: Number },
      inout: { type: Number },
      event: { type: Number },
    },
  ],
  cloudtime: { type: String },
  access: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true },
});

export default mongoose.models.Log || mongoose.model('Log', logSchema);
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    sn: { type: String, required: true },
    cmd: { type: String },
    ret: { type: String },
    count: { type: Number },
    logindex: { type: Number },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    record: [
      {
        enrollid: Number,
        time: String,
        mode: Number,
        inout: Number,
        event: Number,
      },
    ],
    cloudtime: { type: String },
    access: { type: Number },
    timestamp: { type: Date, default: Date.now },
    forwardStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

logSchema.index({ sn: 1, timestamp: -1 });
logSchema.index({ companyId: 1, timestamp: -1 });
logSchema.index({ forwardStatus: 1 });

const Log = mongoose.models.Log || mongoose.model('Log', logSchema);

export default Log;
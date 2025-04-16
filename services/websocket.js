import { WebSocketServer } from 'ws';
import fs from 'fs';
import axios from 'axios';
import mongoose from 'mongoose';
import Device from '../models/Device.js';
import Log from '../models/Log.js';

const logStream = fs.createWriteStream('logs/websocket.log', { flags: 'a' });

function log(message, force = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(logMessage.trim());
  logStream.write(logMessage);
}

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      log('MongoDB connected for WebSocket server', true);
    }
  } catch (err) {
    log(`MongoDB connection error: ${err.message}`, true);
    process.exit(1);
  }
}

async function forwardToCompany(logData, apiUrl) {
  try {
    const response = await axios.post(apiUrl, logData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    if (response.status >= 200 && response.status < 300) {
      await Log.updateOne(
        { _id: logData._id },
        { forwardStatus: 'success', retryCount: logData.retryCount }
      );
      log(`Forwarded log ${logData._id} to ${apiUrl}`);
      return true;
    } else {
      throw new Error(`Non-success status: ${response.status}`);
    }
  } catch (err) {
    const retryCount = (logData.retryCount || 0) + 1;
    await Log.updateOne(
      { _id: logData._id },
      { forwardStatus: 'failed', retryCount }
    );
    log(`Failed to forward log ${logData._id} to ${apiUrl}: ${err.message}, retry ${retryCount}`);
    return false;
  }
}

async function retryPendingLogs() {
  while (true) {
    try {
      const pendingLogs = await Log.find({
        forwardStatus: { $in: ['pending', 'failed'] },
        retryCount: { $lt: 100 },
      })
        .limit(100)
        .lean();
      if (pendingLogs.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 300000)); // 5 min
        continue;
      }
      log(`Retrying ${pendingLogs.length} pending/failed logs`);
      for (const logData of pendingLogs) {
        const device = await Device.findOne({ serialNumber: logData.sn }).lean();
        if (!device || !device.apiUrl) {
          log(`No device or apiUrl for log ${logData._id}, skipping`);
          continue;
        }
        const backoff = Math.min(1000 * Math.pow(2, logData.retryCount || 0), 60000);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        const success = await forwardToCompany(logData, device.apiUrl);
        if (!success && (logData.retryCount || 0) >= 100) {
          log(`Max retries reached for log ${logData._id}, marking permanent failure`);
          await Log.updateOne(
            { _id: logData._id },
            { forwardStatus: 'failed', retryCount: logData.retryCount || 0 }
          );
        }
      }
    } catch (err) {
      log(`Retry loop error: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 min
    }
  }
}

const startWebSocketServer = async () => {
  await connectDB();
  const wss = new WebSocketServer({ port: process.env.WS_PORT });

  retryPendingLogs().catch((err) => log(`Retry loop crashed: ${err.message}`, true));

  wss.on('connection', async (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    log(`Device connected from ${clientIp}`);

    ws.on('message', async (message) => {
      log(`Received: ${message}`);
      let data;
      try {
        data = JSON.parse(message);
      } catch (e) {
        log(`Invalid JSON: ${e.message}`);
        return;
      }

      const device = await Device.findOne({ serialNumber: data.sn }).populate('companyId');
      if (!device || !device.isActive || !device.companyId) {
        log(`Unauthorized, inactive, or no company for device: ${data.sn}`);
        ws.send(JSON.stringify({ error: 'Device not authorized, inactive, or missing company' }));
        ws.close();
        return;
      }

      if (data.cmd === 'reg') {
        const now = new Date().toISOString().replace('T', ' ').split('.')[0];
        const today = new Date().toISOString().split('T')[0];
        const response = {
          ret: 'reg',
          result: true,
          sn: data.sn || '',
          cloudtime: now,
          nosenduser: true,
        };
        ws.send(JSON.stringify(response));
        log(`Sent: ${JSON.stringify(response)}`);
        const getTodayLogs = {
          cmd: 'getalllog',
          stn: true,
          from: today,
          to: today,
        };
        ws.send(JSON.stringify(getTodayLogs));
        log(`Sent: ${JSON.stringify(getTodayLogs)}`);
      } else if (data.ret === 'getalllog') {
        if (data.result && data.count > 0) {
          const existingTimes = new Set(
            (await Log.find({ sn: data.sn }).distinct('record.time')).map(String)
          );
          const newRecords = data.record.filter((r) => !existingTimes.has(r.time));
          if (newRecords.length > 0) {
            const newLog = {
              sn: data.sn,
              ret: 'getalllog',
              result: true,
              count: newRecords.length,
              record: newRecords,
              companyId: device.companyId,
              timestamp: new Date(),
              forwardStatus: 'pending',
              retryCount: 0,
            };
            const savedLog = await Log.create(newLog);
            await forwardToCompany(savedLog, device.apiUrl);
            log(`Saved ${newRecords.length} new logs from getalllog`);
          } else {
            log('No new logs to save from getalllog');
          }
          const ack = { cmd: 'getalllog', stn: false };
          ws.send(JSON.stringify(ack));
          log(`Sent: ${JSON.stringify(ack)}`);
        } else {
          log('Retrieved all logs for today or no logs available');
        }
      } else if (data.cmd === 'sendlog') {
        const existingTimes = new Set(
          (await Log.find({ sn: data.sn }).distinct('record.time')).map(String)
        );
        const newRecords = data.record.filter((r) => !existingTimes.has(r.time));
        if (newRecords.length > 0) {
          const newLog = {
            sn: data.sn,
            cmd: 'sendlog',
            count: newRecords.length,
            logindex: data.logindex || 0,
            record: newRecords,
            companyId: device.companyId,
            cloudtime: new Date().toISOString().replace('T', ' ').split('.')[0],
            access: 1,
            timestamp: new Date(),
            forwardStatus: 'pending',
            retryCount: 0,
          };
          const savedLog = await Log.create(newLog);
          await forwardToCompany(savedLog, device.apiUrl);
          log(`Saved ${newRecords.length} new logs from sendlog`);
        } else {
          log('No new logs to save from sendlog');
        }
        const response = {
          ret: 'sendlog',
          result: true,
          count: data.count,
          logindex: data.logindex || 0,
          cloudtime: new Date().toISOString().replace('T', ' ').split('.')[0],
          access: 1,
        };
        ws.send(JSON.stringify(response));
        log(`Sent: ${JSON.stringify(response)}`);
      } else if (data.cmd === 'senduser') {
        log(`Received unexpected senduser for enrollid ${data.enrollid}`);
        const response = {
          ret: 'senduser',
          result: true,
          cloudtime: new Date().toISOString().replace('T', ' ').split('.')[0],
        };
        ws.send(JSON.stringify(response));
        log(`Sent: ${JSON.stringify(response)}`);
      } else {
        const response = `Unknown command: ${data.cmd || data.ret}`;
        ws.send(response);
        log(`Sent: ${response}`);
      }
    });

    ws.on('close', () => {
      log(`Device disconnected from ${clientIp}`);
    });

    ws.on('error', (error) => {
      log(`Error: ${error.message}`);
    });
  });

  log(`WebSocket server started on ws://0.0.0.0:${process.env.WS_PORT}`, true);
};

export default startWebSocketServer;
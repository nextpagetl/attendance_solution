# Attendance System Deployment

This is an attendance tracking system built with [Next.js](https://nextjs.org) for the frontend dashboard, a Node.js WebSocket server for device communication, MongoDB for data storage, Tailwind CSS for styling, and JWT for authentication. It supports 100+ companies, 1000+ devices (e.g., AiFace), and millions of users, with deployment on DigitalOcean.

## Getting Started

### Prerequisites

- **Node.js**: v20.x (recommended, supports Next.js 15.3.0 features like `??=`).
- **MongoDB**: v6.x or higher, running locally or on a managed service.
- **npm**: v10.x (comes with Node.js 20).
- **Git**: For cloning and version control.
- **DigitalOcean**: For production deployment (optional).

Install Node.js 20:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update
sudo apt install -y nodejs
node -v  # Should output v20.x.x
```

Install MongoDB (local):
```bash
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nextpagetl/attendance_solution.git
   cd attendance-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the project root:
   ```bash
   nano .env
   ```
   Add:
   ```env
   MONGO_URI=mongodb://localhost:27017/attendance
   WS_PORT=7792
   ```
   Save and secure:
   ```bash
   chmod 600 .env
   ```

4. **Run the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   - Opens `http://localhost:3000` (or `http://0.0.0.0:3000` on your network).
   - Displays the dashboard for viewing attendance logs.
   - Auto-updates on changes to `app/` files.

5. **Run the WebSocket Server** (in another terminal):
   ```bash
   node server.js
   ```
   - Starts WebSocket server on `ws://0.0.0.0:7792`.
   - Handles device communication (e.g., `AYSK15017220`).

6. **Test Device Integration**:
   - Configure AiFace device to connect to `ws://0.0.0.0:7792` with serial number `AYSK15017220`.
   - Trigger a scan (fingerprint/card) or simulate:
     ```bash
     wscat -c ws://0.0.0.0:7792
     ```
     Send:
     ```json
     {"cmd":"reg","sn":"AYSK15017220"}
     ```
     ```json
     {"cmd":"sendlog","sn":"AYSK15017220","count":1,"logindex":1,"record":[{"enrollid":1,"time":"2025-04-16T09:00:00","mode":1,"inout":0,"event":0}]}
     ```
   - Check logs:
     ```bash
     tail -f logs/websocket.log
     ```

7. **Access Dashboard**:
   - Visit `http://0.0.0.0:3000`.
   - Login with credentials (e.g., `admin`/`securepassword123`).
   - View logs for devices and companies.

### MongoDB Setup

1. **Verify MongoDB**:
   ```bash
   mongosh mongodb://localhost:27017/attendance
   ```
   ```javascript
   db.getName()  // Outputs: attendance
   ```

2. **Seed Initial Data**:
   ```javascript
   use attendance
   db.companies.insertOne({
     name: "Default Company",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   db.devices.insertOne({
     serialNumber: "AYSK15017220",
     companyId: ObjectId("<company_id>"),
     apiUrl: "http://0.0.0.0:3000/api/logs",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

3. **Add Indexes** (for retry logic):
   ```javascript
   db.logs.createIndex({ forwardStatus: 1 })
   db.logs.createIndex({ sn: 1, timestamp: -1 })
   db.logs.createIndex({ companyId: 1, timestamp: -1 })
   ```

## Project Structure

- **`app/`**: Next.js frontend (dashboard, API routes like `/api/logs`).
- **`models/`**: Mongoose schemas (`Company.js`, `Device.js`, `Log.js`).
- **`services/websocket.js`**: WebSocket server for devices, with retry logic for forwarding logs.
- **`server.js`**: Entry point for WebSocket server.
- **`.env`**: Environment variables (`MONGO_URI`, `WS_PORT`).
- **`logs/websocket.log`**: WebSocket server logs.

Key features:
- **Frontend**: Next.js 15.3.0 with Tailwind CSS, JWT auth.
- **Backend**: Node.js WebSocket server, MongoDB for logs/devices/companies.
- **Retry Logic**: Logs retry forwarding to `apiUrl` if failed, ensuring no data loss.
- **Scalability**: Supports 100+ companies, 1000+ devices, millions of logs.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Frontend features and API routes.
- [Mongoose Documentation](https://mongoosejs.com/docs/) - MongoDB ORM for models.
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) - Device communication protocol.
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling for dashboard.
- [DigitalOcean Node.js Deployment](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu) - Production setup guide.

Contribute at [your GitHub repo](#) - feedback welcome!

## Deploy on DigitalOcean

### Prerequisites

- DigitalOcean Droplet (Ubuntu 22.04, 8 GB RAM recommended).
- Domain: `example.com` (IP `000.000.000.000`).
- SSH access: `root@000.000.000.000`.

### Deployment Steps

1. **Set Up Droplet**:
   - Create an Ubuntu 22.04 Droplet.
   - SSH:
     ```bash
     ssh root@000.000.000.000
     ```

2. **Install Dependencies**:
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm mongodb nginx
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   node -v  # Should be v20.x.x
   ```

3. **Copy Project**:
   ```bash
   scp -r /home/nextpage/Public/attendance_server/attendance-system root@000.000.000.000:~/node_websocket/
   ```

4. **Configure Project**:
   ```bash
   ssh root@000.000.000.000
   cd ~/node_websocket
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

5. **Set Environment Variables**:
   ```bash
   nano ~/node_websocket/.env
   ```
   ```env
   MONGO_URI=mongodb://localhost:27017/attendance
   WS_PORT=7792
   ```
   - Use managed MongoDB URI if applicable.
   ```bash
   chmod 600 .env
   ```

6. **Run Servers**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "nextjs" -- start
   pm2 start server.js --name "websocket"
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/example
   ```
   ```nginx
   server {
     listen 80;
     server_name example.com 000.000.000.000;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }

     location /ws/ {
       proxy_pass http://localhost:7792;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
     }
   }
   ```
   ```bash
   sudo ln -s /etc/nginx/sites-available/example /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Secure with SSL**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d example.com
   ```

9. **Test Deployment**:
   - WebSocket:
     ```bash
     wscat -c ws://000.000.000.000:7792
     ```
     ```json
     {"cmd":"reg","sn":"AYSK15017220"}
     ```
   - Dashboard: Visit `https://example.com`.
   - Logs:
     ```bash
     tail -f ~/node_websocket/logs/websocket.log
     ```

10. **MongoDB**:
    - Local:
      ```bash
      sudo systemctl start mongodb
      sudo systemctl enable mongodb
      ```
    - Seed data (as in local setup).
    - For managed MongoDB, update `MONGO_URI` in `.env`.

### Verify Deployment

- **Device**: Connect AiFace to `ws://000.000.000.000:7792`, check logs.
- **Dashboard**: Login at `https://example.com`, view logs.
- **Retry Logic**:
  ```bash
  mongosh
  ```
  ```javascript
  db.devices.updateOne(
    { serialNumber: "AYSK15017220" },
    { $set: { apiUrl: "http://000.000.000.000:9999/api/logs" } }
  )
  ```
  - Send log, verify retries:
    ```bash
    tail -f logs/websocket.log
    ```
  - Restore:
    ```javascript
    db.devices.updateOne(
      { serialNumber: "AYSK15017220" },
      { $set: { apiUrl: "http://000.000.000.000:3000/api/logs" } }
    )
    ```

## Troubleshooting

- **Next.js Errors**:
  ```bash
  npm run build
  node -v  # Ensure v20.x
  npm install next@15.3.0
  ```
- **WebSocket**:
  ```bash
  tail -f logs/websocket.log
  ```
- **MongoDB**:
  ```bash
  sudo systemctl status mongodb
  mongosh mongodb://localhost:27017/attendance
  db.devices.find({ serialNumber: "AYSK15017220" })
  ```
- **Nginx**:
  ```bash
  sudo nginx -t
  sudo systemctl status nginx
  ```

Contact support at akram@nextpagetl.com or open an issue at [\[attendance_solution
\]](https://github.com/nextpagetl/attendance_solution.git).

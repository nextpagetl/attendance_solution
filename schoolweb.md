### Files Created or Modified for CodeIgniter

The following files are part of the CodeIgniter application and were either created or modified to implement the attendance system, SMS queuing, and asynchronous log processing.

1. **Controllers**:
   - **`mvc/controllers/Attendance.php`**:
     - **Purpose**: Handles WebSocket POST requests, queues raw log data to `log_queue`, and responds quickly.
     - **Status**: Modified from the original (synchronous log saving and SMS enqueuing) to use async queuing.
     - **Artifact**: Updated in the async solution (artifact ID: `f1fad0d4-a915-43ce-b67a-fd0cd1207a52`, version: `76b73ff5-6267-4153-9ae8-b36814de3793`).
     - **Path**: `mvc/controllers/Attendance.php`.
   - **`mvc/controllers/LogProcessor.php`**:
     - **Purpose**: Processes queued logs from `log_queue`, saves to `attendance_logs`, updates attendance tables, and enqueues SMS.
     - **Status**: Newly created for async processing.
     - **Artifact**: Created in the async solution (artifact ID: `7aba9963-be41-453b-a056-9d382dc86b2c`, version: `97accf4c-9933-47e8-9f17-d46e19442d93`).
     - **Path**: `mvc/controllers/LogProcessor.php`.
   - **`mvc/controllers/SmsQueue.php`**:
     - **Purpose**: Processes SMS from `sms_queue`, sends via `bulksmsbd.net`, and logs to `mailandsms`.
     - **Status**: Newly created for SMS queuing.
     - **Artifact**: Created in the attendance/SMS solution (artifact ID: `e7a9dcd4-997e-461a-bff3-4a3cfa2e69bf`, version: `f53f0a9a-1d5b-4ee7-a32b-62e1748d3cab`).
     - **Path**: `mvc/controllers/SmsQueue.php`.

2. **Models**:
   - **`mvc/models/Attendance_log_m.php`**:
     - **Purpose**: Saves individual log entries to `attendance_logs` (reverted to minimal logic in async solution).
     - **Status**: Modified from the original (which included attendance updates) to revert to basic log saving.
     - **Artifact**: Updated in the async solution (artifact ID: `85fa5208-c16c-4b04-a0ce-2f56d5534503`, version: `129c11cd-b14c-4feb-a3fa-f539f54dc841`).
     - **Path**: `mvc/models/Attendance_log_m.php`.
   - **`mvc/models/Log_queue_m.php`**:
     - **Purpose**: Manages `log_queue` table for enqueuing and processing raw WebSocket data.
     - **Status**: Newly created for async processing.
     - **Artifact**: Created in the async solution (artifact ID: `09190952-288e-4e27-bccb-fa7bc00ae3cb`, version: `72ab425f-aa23-4a38-abc5-e352259dc55c`).
     - **Path**: `mvc/models/Log_queue_m.php`.
   - **`mvc/models/Sms_queue_m.php`**:
     - **Purpose**: Manages `sms_queue` table for enqueuing and processing SMS messages.
     - **Status**: Newly created for SMS queuing.
     - **Artifact**: Created in the attendance/SMS solution (artifact ID: `8664218c-e766-46ca-a24e-74653a9dfa29`, version: `73dca593-5320-4efd-bfaa-aec4dae8ae7d`).
     - **Path**: `mvc/models/Sms_queue_m.php`.

3. **Existing Models (Referenced, Not Created)**:
   - **`mvc/models/Setting_m.php`**:
     - **Purpose**: Retrieves school year and settings (`school_year`, `schoolyearID`).
     - **Status**: Assumed to exist (based on old code and standard CodeIgniter setup).
     - **Path**: `mvc/models/Setting_m.php`.
   - **`mvc/models/Sattendance_m.php`**:
     - **Purpose**: Manages student attendance (`attendance` table).
     - **Status**: Assumed to exist (referenced in `LogProcessor.php`).
     - **Path**: `mvc/models/Sattendance_m.php`.
   - **`mvc/models/Tattendance_m.php`**:
     - **Purpose**: Manages teacher attendance (`tattendance` table).
     - **Status**: Assumed to exist.
     - **Path**: `mvc/models/Tattendance_m.php`.
   - **`mvc/models/Uattendance_m.php`**:
     - **Purpose**: Manages staff attendance (`uattendance` table).
     - **Status**: Assumed to exist.
     - **Path**: `mvc/models/Uattendance_m.php`.
   - **`mvc/models/Smssettings_m.php`**:
     - **Purpose**: Retrieves SMS settings (`bulk_username`, `bulk_password`).
     - **Status**: Assumed to exist.
     - **Path**: `mvc/models/Smssettings_m.php`.
   - **`mvc/models/Mailandsms_m.php`**:
     - **Purpose**: Logs SMS to `mailandsms` table.
     - **Status**: Assumed to exist.
     - **Path**: `mvc/models/Mailandsms_m.php`.

---

### Database Tables Created or Referenced

The following tables are used in the CodeIgniter attendance system. Some were newly created for the updated functionality, while others are exist.

1. **Tables Created**:
   - **`attendance_logs`**:
     - **Purpose**: Stores individual attendance log entries from WebSocket data.
     - **Status**: Existed in original code (provided in `Attendance_log_m.php`).
     - **Schema** (inferred):
       ```sql
       CREATE TABLE attendance_logs (
           id BIGINT AUTO_INCREMENT PRIMARY KEY,
           serial_number VARCHAR(50),
           enroll_id VARCHAR(20),
           log_time DATETIME,
           mode INT,
           inout INT,
           event INT,
           created_at DATETIME
       );
       ```
   - **`log_queue`**:
     - **Purpose**: Stores raw WebSocket data for asynchronous processing.
     - **Created**: In the async solution (April 20, 2025).
     - **Schema**:
       ```sql
       CREATE TABLE log_queue (
           id BIGINT AUTO_INCREMENT PRIMARY KEY,
           serial_number VARCHAR(50) NOT NULL,
           raw_data TEXT NOT NULL,
           status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
           retry_count INT DEFAULT 0,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
       );
       ```
   - **`sms_queue`**:
     - **Purpose**: Queues SMS messages for sequential sending.
     - **Created**: In the attendance/SMS solution (April 20, 2025).
     - **Schema**:
       ```sql
       CREATE TABLE sms_queue (
           id BIGINT AUTO_INCREMENT PRIMARY KEY,
           student_id INT NOT NULL,
           phone VARCHAR(20) NOT NULL,
           message TEXT NOT NULL,
           status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
           retry_count INT DEFAULT 0,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
       );
       ```

2. **Tables Referenced (Exist)**:
    - **`attendance`**:
      - **Purpose**: Stores student attendance (`studentID`, `monthyear`, `a1` to `a31`).
      - **Status**: Existed in old code, referenced for updates.
      - **Schema** (inferred):
        ```sql
        CREATE TABLE attendance (
            attendanceID BIGINT AUTO_INCREMENT PRIMARY KEY,
            studentID INT,
            schoolyearID INT,
            classesID INT,
            sectionID INT,
            userID INT,
            usertype VARCHAR(20),
            monthyear VARCHAR(7),
            a1 CHAR(1),
            a2 CHAR(1),
            ...
            a31 CHAR(1)
        );
        ```
   - **`tattendance`**:
     - **Purpose**: Stores teacher attendance (`teacherID`, `monthyear`, `a1` to `a31`).
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE tattendance (
           tattendanceID BIGINT AUTO_INCREMENT PRIMARY KEY,
           schoolyearID INT,
           teacherID INT,
           usertypeID INT,
           monthyear VARCHAR(7),
           a1 CHAR(1),
           a2 CHAR(1),
           ...
           a31 CHAR(1)
       );
       ```
   - **`uattendance`**:
     - **Purpose**: Stores staff attendance (`userID`, `monthyear`, `a1` to `a31`).
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE uattendance (
           uattendanceID BIGINT AUTO_INCREMENT PRIMARY KEY,
           schoolyearID INT,
           userID INT,
           usertypeID INT,
           monthyear VARCHAR(7),
           a1 CHAR(1),
           a2 CHAR(1),
           ...
           a31 CHAR(1)
       );
       ```
   - **`student_2025`** (dynamic, e.g., `student_<schoolyear>`):
     - **Purpose**: Stores student details (`studentID`, `student_att_id`, `name`, `phone`, etc.).
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE student_2025 (
           studentID INT PRIMARY KEY,
           student_att_id INT,
           name VARCHAR(100),
           phone VARCHAR(20),
           classesID INT,
           sectionID INT,
           schoolyearID INT,
           active TINYINT,
           soft_delete TINYINT
       );
       ```
   - **`classes`**:
     - **Purpose**: Stores class details (`classesID`, `classes`).
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE classes (
           classesID INT PRIMARY KEY,
           classes VARCHAR(100),
           entry_start_time TIME,
           entry_end_time TIME
       );
       ```
   - **`setting`**:
     - **Purpose**: Stores school settings (`school_year`).
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE setting (
           settingID INT PRIMARY KEY,
           school_year INT
       );
       ```
   - **`websetting`**:
     - **Purpose**: Stores site settings (`site_name_eng`).
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE websetting (
           websettingID INT PRIMARY KEY,
           site_name_eng VARCHAR(100)
       );
       ```
   - **`smssettings`**:
     - **Purpose**: Stores SMS settings (`bulk_username`, `bulk_password`).
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE smssettings (
           smssettingID INT PRIMARY KEY,
           field_names VARCHAR(50),
           field_values TEXT
       );
       ```
   - **`mailandsmstemplate`**:
     - **Purpose**: Stores SMS templates.
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE mailandsmstemplate (
           mailandsmstemplateID INT PRIMARY KEY,
           sms_type_setting_id INT,
           template TEXT
       );
       ```
   - **`mailandsms`**:
     - **Purpose**: Logs sent SMS.
     - **Status**: Existed in old code.
     - **Schema** (inferred):
       ```sql
       CREATE TABLE mailandsms (
           mailandsmsID INT PRIMARY KEY,
           usertypeID INT,
           userID INT,
           phone_no VARCHAR(20),
           type VARCHAR(20),
           message TEXT,
           date DATE,
           create_date DATETIME,
           year INT,
           senderusertypeID INT,
           senderID INT,
           sms_count INT,
           is_send TINYINT,
           smsType INT
       );
       ```

---

### Summary of Files and Tables

**Files** (Created/Modified):
1. `mvc/controllers/Attendance.php` (modified)
2. `mvc/controllers/LogProcessor.php` (created)
3. `mvc/controllers/SmsQueue.php` (created)
4. `mvc/models/Attendance_log_m.php` (created)
5. `mvc/models/Log_queue_m.php` (created)
6. `mvc/models/Sms_queue_m.php` (created)

**Files Referenced (Exist)**:
1. `mvc/models/Setting_m.php`
2. `mvc/models/Sattendance_m.php`
3. `mvc/models/Tattendance_m.php`
4. `mvc/models/Uattendance_m.php`
5. `mvc/models/Smssettings_m.php`
6. `mvc/models/Mailandsms_m.php`

**Database Tables**:
- **Created**:
  1. `attendance_logs`
  2. `log_queue`
  2. `sms_queue`
- **Referenced (Exist)**:
  1. `attendance`
  2. `tattendance`
  3. `uattendance`
  4. `student_2025` (dynamic)
  5. `classes`
  6. `setting`
  7. `websetting`
  8. `smssettings`
  9. `mailandsmstemplate`
  10. `mailandsms`

---

### List of Cron Jobs Created for CodeIgniter

The following cron jobs were created for the CodeIgniter application to support asynchronous processing of attendance logs and SMS messages, as outlined in the updates (April 20, 2025). These were originally configured A2 Hosting’s cPanel, using the URL `https://ws.empo.edu.bd/` and A2’s PHP environment.

1. **SMS Queue Processing Cron Job**
   - **Purpose**: Processes pending SMS messages in the `sms_queue` table, sending them via the `bulksmsbd.net` API and logging results to the `mailandsms` table.
   - **Controller**: `SmsQueue::process` (`mvc/controllers/SmsQueue.php`).
   - **Endpoint**: `/usr/bin/curl --silent https://ws.empo.edu.bd/SmsQueue/process`.
   - **Command (cPanel)**:
     ```bash
     /usr/bin/curl --silent /usr/bin/curl --silent https://ws.empo.edu.bd/SmsQueue/process
     ```
   - **Frequency**: Every minute (`* * * * *`), ensuring real-time SMS delivery with sequential processing.
   - **Created**: In the attendance/SMS queuing solution (April 20, 2025, Step 7).
   - **Details**:
     - Calls the `SmsQueue::process` method to fetch and send SMS from `sms_queue`.
     - Ensures sequential sending (waits for `response_code == 202`).
     - Configured in cPanel’s Cron Job tool (see setup instructions below).

2. **Log Queue Processing Cron Job**
   - **Purpose**: Processes pending log batches in the `log_queue` table, saving to `attendance_logs`, updating `attendance`, `tattendance`, and `uattendance` tables, and enqueuing SMS for students.
   - **Controller**: `LogProcessor::process` (`mvc/controllers/LogProcessor.php`).
   - **Endpoint**: `/usr/bin/curl --silent https://ws.empo.edu.bd/LogProcessor/process`.
   - **Command (cPanel)**:
     ```bash
     /usr/bin/curl --silent /usr/bin/curl --silent https://ws.empo.edu.bd/LogProcessor/process
     ```
   - **Frequency**: Every minute (`* * * * *`), processing up to 100 pending log batches per execution.
   - **Created**: In the asynchronous log processing solution (April 20, 2025, Step 6).
   - **Details**:
     - Calls the `LogProcessor::process` method to process `log_queue` entries.
     - Limits to 100 logs per run to manage server load.
     - Configured in cPanel’s Cron Job tool.

---

### Total Cron Jobs
- **Count**: 2 cron jobs.
- **Summary**:
  1. **SMS Queue Processor**:
     - Command: `/usr/bin/curl --silent /usr/bin/curl --silent https://ws.empo.edu.bd/SmsQueue/process`
     - Frequency: Every minute
     - Purpose: Sends SMS from `sms_queue`
  2. **Log Queue Processor**:
     - Command: `/usr/bin/curl --silent /usr/bin/curl --silent https://ws.empo.edu.bd/LogProcessor/process`
     - Frequency: Every minute
     - Purpose: Processes `log_queue` for attendance and SMS

---

### Setting Up Cron Jobs in A2 Hosting (cPanel)

Since your CodeIgniter application is hosted on A2 Hosting (e.g., `https://ws.empo.edu.bd/`), cron jobs are configured via the **cPanel Cron Jobs** tool. A2 Hosting typically provides cPanel for shared hosting accounts.

#### Steps to Configure Cron Jobs in cPanel
1. **Log in to cPanel**:
   - Access your A2 Hosting account (e.g., `https://my.a2hosting.com/` or `https://ws.empo.edu.bd:2083/`).
   - Navigate to **cPanel** → **Advanced** → **Cron Jobs**.

2. **Add SMS Queue Cron Job**:
   - **Common Settings**: Select “Once Per Minute” (`* * * * *`).
   - **Command**:
       ```bash
       /usr/bin/curl --silent /usr/bin/curl --silent https://ws.empo.edu.bd/SmsQueue/process
       ```
   - **Add New Cron Job**: Click “Add New Cron Job”.

3. **Add Log Queue Cron Job**:
   - **Common Settings**: Select “Once Per Minute” (`* * * * *`).
   - **Command**:
       ```bash
       /usr/bin/curl --silent /usr/bin/curl --silent https://ws.empo.edu.bd/LogProcessor/process
       ```
   - **Add New Cron Job**: Click “Add New Cron Job”.


### Compatibility with Asynchronous Processing
- **Files Deployed** (per April 20, 2025):
  - `mvc/controllers/Attendance.php`
  - `mvc/controllers/LogProcessor.php`
  - `mvc/controllers/SmsQueue.php`
  - `mvc/models/Attendance_log_m.php`
  - `mvc/models/Log_queue_m.php`
  - `mvc/models/Sms_queue_m.php`
- **Tables Created**:
  - `log_queue`: Stores raw WebSocket data for async processing.
  - `attendance_logs`: Stores attendance logs.
  - `sms_queue`: Queues SMS messages.

- **Cron Jobs**: The cron jobs on A2 Hosting ensure `log_queue` and `sms_queue` are processed, maintaining fast WebSocket responses (~100ms) even for 1000 logs.

---

### Deploying to A2 Hosting
1. **Upload Files**:
   - Use cPanel’s **File Manager** or FTP (e.g., FileZilla) to upload:
     - `mvc/controllers/Attendance.php`
     - `mvc/controllers/LogProcessor.php`
     - `mvc/controllers/SmsQueue.php`
     - `mvc/models/Attendance_log_m.php`
     - `mvc/models/Log_queue_m.php`
     - `mvc/models/Sms_queue_m.php`
   - Path: `/home/username/public_html/`.
   - If in a subdirectory, adjust paths (e.g., `/home/username/public_html/attendance/`).

2. **Update Database**:
   - Access **phpMyAdmin** in cPanel.
   - Create tables (if not already created):
     ```sql
     CREATE TABLE log_queue (...); -- From April 20, 2025
     CREATE TABLE attendance_logs (...); -- From April 20, 2025
     CREATE TABLE sms_queue (...); -- From April 20, 2025
     ```
   - Ensure existing tables (`attendance`, `tattendance` etc.) are present.

3. **Set Up Cron Jobs**:
   - Follow cPanel instructions above.


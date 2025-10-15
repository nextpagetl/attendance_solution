'use client'; // keep this

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
export const dynamic = 'force-dynamic';

export default function DeviceControl() {
  const searchParams = useSearchParams();
  const initialSn = searchParams.get("sn");
  const [serialNumber, setSerialNumber] = useState(initialSn);
  const [commandType, setCommandType] = useState("opendoor");
  const [params, setParams] = useState({});
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSerialNumber(initialSn);
  }, [initialSn]);

  const commands = [
    { value: "getuserlist", label: "Get User List (getuserlist)", params: ["stn"] },
    { value: "getuserinfo", label: "Get User Info (getuserinfo)", params: ["enrollid", "backupnum"] },
    { value: "setuserinfo", label: "Set User Info (setuserinfo)", params: ["enrollid", "name", "backupnum", "admin", "record"] },
    { value: "deleteuser", label: "Delete User (deleteuser)", params: ["enrollid", "backupnum"] },
    { value: "getusername", label: "Get User Name (getusername)", params: ["enrollid"] },
    { value: "setusername", label: "Set User Name (setusername)", params: ["count", "record"] },
    { value: "enableuser", label: "Enable/Disable User (enableuser)", params: ["enrollid", "enflag"] },
    { value: "cleanuser", label: "Clean All Users (cleanuser)", params: [] },
    { value: "getnewlog", label: "Get New Logs (getnewlog)", params: ["stn"] },
    { value: "getalllog", label: "Get All Logs (getalllog)", params: ["stn", "from", "to"] },
    { value: "cleanlog", label: "Clean All Logs (cleanlog)", params: [] },
    { value: "initsys", label: "Initialize System (initsys)", params: [] },
    { value: "reboot", label: "Reboot (reboot)", params: [] },
    { value: "cleanadmin", label: "Clean All Admins (cleanadmin)", params: [] },
    { value: "settime", label: "Set Time (settime)", params: ["cloudtime"] },
    { value: "setdevinfo", label: "Set Device Info (setdevinfo)", params: ["deviceid", "language", "volume", "screensaver", "verifymode", "sleep", "userfpnum", "loghint", "reverifytime"] },
    { value: "getdevinfo", label: "Get Device Info (getdevinfo)", params: [] },
    { value: "opendoor", label: "Open Door (opendoor)", params: ["doornum"] },
    { value: "setdevlock", label: "Set Access Params (setdevlock)", params: ["opendelay", "doorsensor", "alarmdelay", "threat", "InputAlarm", "antpass", "interlock", "mutiopen", "tryalarm", "tamper", "wgformat", "wgoutput", "cardoutput", "dayzone", "weekzone", "lockgroup"] },
    { value: "getdevlock", label: "Get Access Params (getdevlock)", params: [] },
    { value: "getuserlock", label: "Get User Access Params (getuserlock)", params: ["enrollid"] },
    { value: "setuserlock", label: "Set User Access Params (setuserlock)", params: ["count", "record"] },
    { value: "deleteuserlock", label: "Delete User Access Params (deleteuserlock)", params: ["enrollid"] },
    { value: "cleanuserlock", label: "Clean All User Access Params (cleanuserlock)", params: [] },
    { value: "getquestionnaire", label: "Get Questionnaire Params (getquestionnaire)", params: ["stn"] },
    { value: "setquestionnaire", label: "Set Questionnaire Params (setquestionnaire)", params: ["title", "voice", "errmsg", "radio", "optionflag", "usequestion", "useschedule", "card", "items", "schedules"] },
    { value: "getholiday", label: "Get Holiday Params (getholiday)", params: ["stn"] },
    { value: "setholiday", label: "Set Holiday Params (setholiday)", params: ["holidays"] },
    { value: "gettime", label: "Get Time (gettime)", params: [] },
  ];

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const sendCommand = async () => {
    setError(null);
    setResponse(null);

    let command = { cmd: commandType };

    if (commandType === "settime") {
      params.cloudtime = formatInTimeZone(new Date(), "Asia/Dhaka", 'yyyy-MM-dd HH:mm:ss');
    } else if (commandType === "getalllog" && !params.from) {
      const today = formatInTimeZone(new Date(), "Asia/Dhaka", 'yyyy-MM-dd');
      params.from = today;
      params.to = today;
    }

    Object.assign(command, params);

    try {
      const res = await fetch("/api/device-control", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ sn: serialNumber, command }),
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedCommand = commands.find((c) => c.value === commandType);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Device Control Panel</h1>
      <div className="mb-4">
        <label className="block mb-2">Serial Number:</label>
        <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="border p-2 w-full"/>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Command:</label>
        <select value={commandType} onChange={(e) => { setCommandType(e.target.value); setParams({}); }} className="border p-2 w-full">
          {commands.map((cmd) => <option key={cmd.value} value={cmd.value}>{cmd.label}</option>)}
        </select>
      </div>
      {selectedCommand.params.map((param) => (
        <div key={param} className="mb-4">
          <label className="block mb-2">{param}:</label>
          <input type="text" value={params[param] || ""} onChange={(e) => handleParamChange(param, e.target.value)} className="border p-2 w-full" placeholder={`Enter ${param}`} />
        </div>
      ))}
      <button onClick={sendCommand} className="bg-blue-500 text-white p-2 mb-4">Send Command</button>
      {error && <p className="text-red-500">{error}</p>}
      {response && <div>
        <h2 className="text-xl mb-2">Response:</h2>
        <pre className="bg-gray-100 p-4 overflow-auto">{JSON.stringify(response, null, 2)}</pre>
      </div>}
    </div>
  );
}

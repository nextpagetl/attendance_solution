'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DeviceList from '../../components/DeviceList';
import DeviceForm from '../../components/DeviceForm';
import CompanyForm from '../../components/CompanyForm';
import SearchBar from '../../components/SearchBar';

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    // Check token only on client
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false); // Render UI if token exists
      fetchDevices(token);
      fetchCompanies(token);
      fetchLogs(token);
    }
  }, [page, router]);

  const fetchDevices = async (token) => {
    try {
      const res = await axios.get(`/api/devices?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.devices);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchCompanies = async (token) => {
    try {
      const res = await axios.get('/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchLogs = async (token) => {
    try {
      const res = await axios.get('/api/logs?page=1&limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Show loading state during hydration
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl mb-4">Add Device</h2>
          <DeviceForm companies={companies} onSuccess={() => fetchDevices(localStorage.getItem('token'))} />
        </div>
        <div>
          <h2 className="text-xl mb-4">Add Company</h2>
          <CompanyForm onSuccess={() => fetchCompanies(localStorage.getItem('token'))} />
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl mb-4">Recent Logs</h2>
        <ul className="bg-white p-4 rounded shadow">
          {logs.map((log) => (
            <li key={log._id} className="py-2 border-b last:border-0">
              {log.sn} - {log.cmd || log.ret} - {new Date(log.timestamp).toLocaleString()} - {log.count} records
              <ul className="ml-4 mt-1">
                {log.record.map((r, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    User {r.enrollid} at {r.time} (Mode: {r.mode})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <SearchBar onSearch={(results) => setDevices(results)} />
      </div>
      <DeviceList
        devices={devices}
        onUpdate={() => fetchDevices(localStorage.getItem('token'))}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}
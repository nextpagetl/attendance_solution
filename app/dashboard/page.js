'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DeviceForm from '../../components/DeviceForm';
import CompanyForm from '../../components/CompanyForm';
import Link from 'next/link';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
      fetchLogs(token);
      fetchCompanies(token);
    }
  }, [router]);

  const fetchLogs = async (token) => {
    try {
      const res = await axios.get('/api/logs?page=1&limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs);
    } catch (err) {
      setError('Failed to fetch logs');
    }
  };

  const fetchCompanies = async (token) => {
    try {
      const res = await axios.get('/api/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.companies || res.data);
    } catch (err) {
      setError('Failed to fetch companies');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

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
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl mb-4">Add Device</h2>
          <DeviceForm companies={companies} onSuccess={() => router.push('/devices')} />
          <Link href="/devices" className="text-blue-500 hover:underline mt-4 block">
            Manage Devices
          </Link>
        </div>
        <div>
          <h2 className="text-xl mb-4">Add Company</h2>
          <CompanyForm onSuccess={() => router.push('/companies')} />
          <Link href="/companies" className="text-blue-500 hover:underline mt-4 block">
            Manage Companies
          </Link>
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
    </div>
  );
}
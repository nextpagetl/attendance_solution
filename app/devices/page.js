'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import SearchBar from '../../components/SearchBar';

export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchDevices(token);
    }
  }, [page, router]);

  const fetchDevices = async (token, search = '') => {
    try {
      const res = await axios.get(`/api/devices?page=${page}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.devices);
      setTotalPages(res.data.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = (results) => {
    setDevices(results);
    setPage(1); // Reset to first page on search
    setTotalPages(1); // Update based on search results
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Devices</h1>
      <div className="mb-4">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
      <div className="mb-6">
        <SearchBar endpoint="/api/devices" onSearch={handleSearch} />
      </div>
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Serial Number</th>
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">API URL</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device._id} className="border-b">
                <td className="p-2">{device.serialNumber}</td>
                <td className="p-2">{device.companyId?.name || 'N/A'}</td>
                <td className="p-2">{device.apiUrl}</td>
                <td className="p-2">{device.isActive ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <Link
                    href={`/devices/control?sn=${device.serialNumber}`}
                    className="bg-blue-500 text-white px-4 py-2 mx-2 rounded hover:bg-blue-600"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/devices/${device._id}`}
                    className="bg-blue-500 text-white px-4 py-2 mx-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
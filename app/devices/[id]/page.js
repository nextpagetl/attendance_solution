'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function EditDevice() {
  const [serialNumber, setSerialNumber] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    async function fetchDevice() {
      try {
        const { data } = await axios.get(`/api/devices/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSerialNumber(data.serialNumber);
        setApiUrl(data.apiUrl);
        setIsActive(data.isActive);
      } catch (error) {
        alert('Failed to fetch device');
      }
    }
    fetchDevice();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/devices/${id}`, { serialNumber, apiUrl, isActive }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Device updated');
      router.push('/devices');
    } catch (error) {
      alert('Failed to update device');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Edit Device</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="Serial Number"
            className="border p-2 w-full"
          />
        </div>
        <div>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="API URL"
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Update
        </button>
      </form>
      <div className="mt-4">
        <Link href="/devices" className="text-blue-500 hover:underline">
          Back to Devices
        </Link>
      </div>
    </div>
  );
}
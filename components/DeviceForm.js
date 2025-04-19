'use client';
import { useState } from 'react';
import axios from 'axios';

export default function DeviceForm({ companies, onSuccess }) {
  const [serialNumber, setSerialNumber] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.post(
        '/api/devices',
        { serialNumber, companyId, apiUrl, isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) {
        setSerialNumber('');
        setCompanyId('');
        setApiUrl('');
        setIsActive(true);
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add device');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Serial Number</label>
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="e.g., AYSK15017220"
          className="border p-2 w-full rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Company</label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">API URL</label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="e.g., https://eduguard360.com/attendance"
          className="border p-2 w-full rounded"
          required
        />
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Add Device
      </button>
    </form>
  );
}
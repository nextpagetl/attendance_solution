import { useState } from 'react';
import axios from 'axios';

export default function DeviceForm({ companies, onSuccess }) {
  const [serialNumber, setSerialNumber] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/devices',
        { serialNumber, companyId, apiUrl },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSerialNumber('');
      setCompanyId('');
      setApiUrl('');
      setError('');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding device');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Serial Number"
        value={serialNumber}
        onChange={(e) => setSerialNumber(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <select
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Company</option>
        {companies.map((company) => (
          <option key={company._id} value={company._id}>
            {company.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="API URL"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        Add Device
      </button>
    </form>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function EditDevice() {
  const [serialNumber, setSerialNumber] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState([]);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch device
        const { data: device } = await axios.get(`/api/devices/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSerialNumber(device.serialNumber);
        setApiUrl(device.apiUrl);
        setIsActive(device.isActive);
        setCompanyId(device.companyId._id); // Set current companyId

        // Fetch companies
        const { data: companiesData } = await axios.get('/api/companies', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setCompanies(companiesData.companies);
      } catch (error) {
        alert('Failed to fetch data');
      }
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `/api/devices/${id}`,
        { serialNumber, apiUrl, isActive, companyId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
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
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="border p-2 w-full"
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
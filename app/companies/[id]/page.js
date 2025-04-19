'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function EditCompany() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    async function fetchCompany() {
      try {
        const { data } = await axios.get(`/api/companies/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setName(data.name);
      } catch (error) {
        alert('Failed to fetch company');
      }
    }
    fetchCompany();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/companies/${id}`, { name }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Company updated');
      router.push('/companies');
    } catch (error) {
      alert('Failed to update company');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Edit Company</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company Name"
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Update
        </button>
      </form>
      <div className="mt-4">
        <Link href="/companies" className="text-blue-500 hover:underline">
          Back to Companies
        </Link>
      </div>
    </div>
  );
}
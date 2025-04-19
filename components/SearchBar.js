'use client';
import { useState } from 'react';
import axios from 'axios';

export default function SearchBar({ endpoint, onSearch }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.get(`${endpoint}?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const results = endpoint.includes('companies') ? res.data.companies : res.data.devices;
      onSearch(results);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to search ${endpoint.includes('companies') ? 'companies' : 'devices'}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={endpoint.includes('companies') ? 'Search by company name' : 'Search by serial number or company name'}
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Search
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
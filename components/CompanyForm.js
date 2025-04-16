import { useState } from 'react';
import axios from 'axios';

export default function CompanyForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/companies',
        { name },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setName('');
      setError('');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding company');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        Add Company
      </button>
    </form>
  );
}
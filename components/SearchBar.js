import { useState } from 'react';
import axios from 'axios';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query) {
      onSearch([]);
      return;
    }
    try {
      const res = await axios.get(`/api/devices/search?query=${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      onSearch(res.data);
    } catch (error) {
      console.error('Error searching devices:', error);
    }
  };

  return (
    <div className="flex">
      <input
        type="text"
        placeholder="Search devices..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 border rounded-l flex-grow"
      />
      <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded-r">
        Search
      </button>
    </div>
  );
}
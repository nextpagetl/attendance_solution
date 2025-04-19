'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import SearchBar from '../../components/SearchBar';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchCompanies(token);
    }
  }, [page, router]);

  const fetchCompanies = async (token, search = '') => {
    try {
      const res = await axios.get(`/api/companies?page=${page}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.companies || res.data);
      setTotalPages(res.data.totalPages || 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = (results) => {
    setCompanies(results);
    setPage(1); // Reset to first page on search
    setTotalPages(1); // Update based on search results
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Companies</h1>
      <div className="mb-4">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
      <div className="mb-6">
        <SearchBar endpoint="/api/companies" onSearch={handleSearch} />
      </div>
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Created At</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company._id} className="border-b">
                <td className="p-2">{company.name}</td>
                <td className="p-2">{new Date(company.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
                  <Link
                    href={`/companies/${company._id}`}
                    className="text-blue-500 hover:underline"
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
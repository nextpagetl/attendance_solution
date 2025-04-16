'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Eduguard360 Attendance</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Securely manage attendance devices and companies.
      </p>
      <Link href="/login">
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition">
          Login
        </button>
      </Link>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';

// SVG Icon for the Search Button
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-gray-700"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Main App Component
export default function Page() {
  // State to hold the search input value
    const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    // Handle the search logic here, e.g., API call
    router.push('/absen/foto');
    // You could show an alert or a message box here, but for this example, we'll log to console.
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <Header />

      {/* Main Content Area */}
      <main className="flex flex-col items-center justify-center w-full" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 tracking-wider mb-10">
            ABSEN APEL
          </h1>
          
          {/* Search Bar Component */}
        <div className="mt-6 flex rounded-lg shadow-lg max-w-xl mx-auto">
            <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan nama/nip pegawai..."
                className="w-full px-6 py-4 text-lg text-gray-700 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                aria-label="Search by employee name or ID"
            />
            <button
                onClick={handleSearch}
                className="px-5 py-4 bg-[#22B573] border border-l-0 border-[#22B573] rounded-r-lg hover:bg-[#1a9e5f] focus:outline-none focus:ring-2 focus:ring-[#22B573] transition duration-300"
                aria-label="Search"
            >
                <SearchIcon />
            </button>
        </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';
import { searchEmployees, type DatabaseEmployee } from '../database/actions';

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
  const router = useRouter();
  // State to hold the search input value
  const [searchValue, setSearchValue] = useState('');
  // State to hold search results
  const [searchResults, setSearchResults] = useState<DatabaseEmployee[]>([]);
  // State to control loading
  const [isLoading, setIsLoading] = useState(false);
  // State to track if search has been performed
  const [hasSearched, setHasSearched] = useState(false);

  // Function to perform search
  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchEmployees(searchTerm);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchValue);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const handleSearch = () => {
    if (searchResults.length === 1) {
      // If only one result, navigate directly
      router.push(`/absen/foto?nip=${searchResults[0].nip}&nama=${encodeURIComponent(searchResults[0].nama)}`);
    } else if (searchResults.length > 1) {
      // If multiple results, let user select from the dropdown
      console.log('Multiple results found, please select one');
    } else {
      // No results
      console.log('No employee found');
    }
  };

  const handleEmployeeSelect = (employee: DatabaseEmployee) => {
    router.push(`/absen/foto?nip=${employee.nip}&nama=${encodeURIComponent(employee.nama)}`);
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
          <div className="mt-6 relative max-w-xl mx-auto">
            <div className="flex rounded-lg shadow-lg">
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
                  disabled={isLoading}
                  className="px-5 py-4 bg-[#22B573] border border-l-0 border-[#22B573] rounded-r-lg hover:bg-[#1a9e5f] focus:outline-none focus:ring-2 focus:ring-[#22B573] transition duration-300 disabled:opacity-50"
                  aria-label="Search"
              >
                  {isLoading ? (
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <SearchIcon />
                  )}
              </button>
            </div>

            {/* Search Results Dropdown */}
            {searchValue && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="px-6 py-4 text-center text-gray-500">
                    Mencari pegawai...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className="px-6 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition duration-200 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">{employee.nama}</div>
                          <div className="text-sm text-gray-600">NIP: {employee.nip}</div>
                          {employee.jabatan && (
                            <div className="text-sm text-gray-500">{employee.jabatan}</div>
                          )}
                        </div>
                        {employee.foto && (
                          <Image
                            src={employee.foto}
                            alt={employee.nama}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : hasSearched ? (
                  <div className="px-6 py-4 text-center text-gray-500">
                    Pegawai tidak ditemukan
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
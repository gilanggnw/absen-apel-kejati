'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';
import { searchEmployees, type DatabaseEmployee } from '../database/actions';

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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

// SVG Icon for the Info/Help Button
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

// SVG Icon for Close Button
const CloseIcon = () => (
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
    className="h-6 w-6"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Main App Component
export default function Page() {
  const router = useRouter();
  // State to hold the search input value
  const [searchValue, setSearchValue] = useState('');
  // State to control the how-to modal
  const [showHowToModal, setShowHowToModal] = useState(false);
  // State for keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounce search value with shorter delay for better responsiveness
  const debouncedSearchValue = useDebounce(searchValue, 200);

  // React Query for search results with optimizations
  const { 
    data: searchResults = [], 
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ['employee-search', debouncedSearchValue],
    queryFn: () => searchEmployees(debouncedSearchValue),
    enabled: !!debouncedSearchValue.trim() && debouncedSearchValue.trim().length >= 2, // Only search with 2+ characters
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1, // Only retry once on failure
  });

  // Track if search has been performed
  const hasSearched = !!debouncedSearchValue.trim();

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
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        // Navigate to selected item
        handleEmployeeSelect(searchResults[selectedIndex]);
      } else {
        // Use default search behavior
        handleSearch();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (event.key === 'Escape') {
      setSelectedIndex(-1);
      setSearchValue('');
    }
  };

  // Reset selected index when search results change
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <Header />

      {/* How to Use Button - Fixed position bottom right */}
      <button
        onClick={() => setShowHowToModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg transition duration-300 flex items-center gap-2 z-20 m-4"
        aria-label="Cara Penggunaan"
      >
        <InfoIcon />
        <span className="text-sm font-medium">Cara Penggunaan</span>
      </button>

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
                  placeholder="Cari dengan nama atau NIP (min. 2 karakter)..."
                  className="w-full px-6 py-4 text-lg text-gray-700 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  aria-label="Search by employee name or ID"
                  autoComplete="off"
                  spellCheck="false"
              />
              <button
                  onClick={handleSearch}
                  disabled={isLoading || isFetching}
                  className="px-5 py-4 bg-[#22B573] border border-l-0 border-[#22B573] rounded-r-lg hover:bg-[#1a9e5f] focus:outline-none focus:ring-2 focus:ring-[#22B573] transition duration-300 disabled:opacity-50"
                  aria-label="Search"
              >
                  {isLoading || isFetching ? (
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <SearchIcon />
                  )}
              </button>
            </div>

            {/* Search Results Dropdown */}
            {searchValue && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchValue.trim().length < 2 ? (
                  <div className="px-6 py-4 text-center text-gray-500">
                    Masukkan minimal 2 karakter untuk mencari...
                  </div>
                ) : isLoading || isFetching ? (
                  <div className="px-6 py-4 text-center text-gray-500 flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    Mencari pegawai...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((employee, index) => (
                    <div
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`px-6 py-3 cursor-pointer border-b last:border-b-0 transition duration-200 text-left ${
                        index === selectedIndex 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
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

      {/* How to Use Modal */}
      {showHowToModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Cara Penggunaan Absen Apel</h2>
              <button
                onClick={() => setShowHowToModal(false)}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#22B573] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Cari Pegawai</h3>
                    <p className="text-gray-600 text-sm">Ketik nama atau NIP pegawai di kolom pencarian. Sistem akan menampilkan hasil secara otomatis.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#22B573] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Pilih Pegawai</h3>
                    <p className="text-gray-600 text-sm">Klik pada nama pegawai yang sesuai dari daftar hasil pencarian.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#22B573] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Ambil Foto</h3>
                    <p className="text-gray-600 text-sm">Sistem akan mengarahkan ke halaman kamera untuk mengambil foto kehadiran.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#22B573] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Konfirmasi Absen</h3>
                    <p className="text-gray-600 text-sm">Pastikan foto sudah sesuai, lalu konfirmasi untuk menyelesaikan proses absen.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Tips:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Pastikan koneksi internet stabil</li>
                  <li>• Gunakan nama lengkap atau NIP yang tepat</li>
                  <li>• Foto harus jelas dan terlihat wajah</li>
                </ul>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowHowToModal(false)}
                className="w-full bg-[#22B573] hover:bg-[#1a9e5f] text-white px-4 py-2 rounded-lg transition duration-300 font-medium"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
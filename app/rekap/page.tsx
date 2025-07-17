'use client';

import React from 'react';

// --- Helper Components ---

// Icon for the user profile
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-600"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

interface HeaderProps {
  username: string;
  logoContent: React.ReactNode;
}

// Header Component
const Header = ({ username, logoContent }: HeaderProps) => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div>{logoContent}</div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-700">Welcome {username}</span>
        <UserIcon />
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-200">
      <nav>
        <ul>
          <li>
            <a
              href="#"
              className="block py-3 px-4 text-lg font-semibold bg-white rounded-lg shadow"
            >
              Rekap
            </a>
          </li>
          <li className="mt-2">
            <a
              href="#"
              className="block py-3 px-4 text-lg text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              Verifikasi
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

// Main Page Component
const AbsenApelPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <Header
        username="adminverif (Administrator)"
        logoContent={
          <h1 className="text-3xl font-bold text-black">Absen Apel</h1>
        }
      />
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex items-center mb-6">
            <label htmlFor="date-picker" className="text-lg font-medium text-gray-700 mr-4">
              Pilih Tanggal:
            </label>
            <select
              id="date-picker"
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            >
              <option>11 Juli 2025</option>
              {/* You can add more dates here */}
              <option>12 Juli 2025</option>
              <option>13 Juli 2025</option>
            </select>
          </div>

          {/* Stats and Report Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex space-x-6 bg-gray-200 p-6 rounded-lg shadow-inner">
              <div className="text-center">
                <div className="text-gray-600">Total Pegawai</div>
                <div className="text-3xl font-bold text-black">400</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Hadir</div>
                <div className="text-3xl font-bold text-green-600">259</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Tidak Hadir</div>
                <div className="text-3xl font-bold text-red-600">141</div>
              </div>
            </div>
            <button className="py-2 px-6 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Cetak Laporan
            </button>
          </div>

          {/* Table Placeholder */}
          <div className="bg-gray-200 rounded-lg p-4 shadow-inner flex-1 h-[50vh] flex items-center justify-center">
            <div className="text-center text-gray-500 text-xl">
              <p>tabel rekapan</p>
              <p>based on</p>
              <p>jam dateng</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AbsenApelPage;

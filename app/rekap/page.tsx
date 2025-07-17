'use client';

import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

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

          {/* Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Lengkap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Kehadiran
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ahmad Susanto</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">196801011990031002</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">07:02:23</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Tepat Waktu
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Bambang Prasetyo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">198003201998031003</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">07:28:12</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Tepat Waktu
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Siti Nurhaliza</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">197205152000032001</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">08:00:40</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Terlambat
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AbsenApelPage;

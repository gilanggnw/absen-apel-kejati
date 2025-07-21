'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
            {/* Pop-up Calendar Date Picker with Arrow and Gray Outline */}
            <div className="relative w-48">
              <DatePicker
                id="date-picker"
                selected={useState(new Date())[0]}
                onChange={() => {}}
                dateFormat="dd MMMM yyyy"
                className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-gray-600 focus:ring focus:ring-gray-200 focus:ring-opacity-50 p-2 pr-10"
              />
              {/* Arrow icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
            <button className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105">
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

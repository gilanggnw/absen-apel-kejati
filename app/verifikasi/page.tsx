'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Main Page Component
const VerifikasiPage = () => {
  const [showDialog, setShowDialog] = useState(false);
  const handleVerifikasiClick = () => setShowDialog(true);
  const handleCloseDialog = () => setShowDialog(false);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <Header
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
                <div className="text-gray-600">Terverifikasi</div>
                <div className="text-3xl font-bold text-green-600">200</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Menunggu</div>
                <div className="text-3xl font-bold text-red-600">200</div>
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
                        Ketepatan Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hasil Verifikasi
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FFD600] text-[#000000]">
                        Terverifikasi
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white cursor-not-allowed" disabled>
                          Diterima
                        </button>
                    </td>
                    </tr>
                    <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Bambang Prasetyo</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">198003201998031003</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">07:28:12</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">
                        Menunggu
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="px-3 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl border-2 border-blue-300" onClick={handleVerifikasiClick}>
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Verifikasi!
                          </span>
                        </button>
                    </td>
                    </tr>
                    <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Siti Nurhaliza</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">197205152000032001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">08:00:40</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FFD600] text-[#000000]">
                        Terverifikasi
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white cursor-not-allowed" disabled>
                          Diterima
                        </button>
                    </td>
                    </tr>
                    <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Andi Setiawan</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">198801222012061028</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">08:45:15</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-800">
                        Ditolak
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white cursor-not-allowed" disabled>
                          Ditolak
                        </button>
                    </td>
                    </tr>
                </tbody>
            </table>
          </div>

        {/* Dialog Modal */}
        {showDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.75)' }}>
            <div className="bg-white rounded-lg shadow-xl p-10 w-full max-w-2xl relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold" onClick={handleCloseDialog}>&times;</button>
              <h2 className="text-2xl font-bold mb-8 text-center">Verifikasi Pegawai</h2>
              <div className="flex justify-center gap-8 mb-10">
                <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">Foto 1</div>
                <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">Foto 2</div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <button className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-all duration-200">Approve</button>
                <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-all duration-200">Decline</button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default VerifikasiPage;

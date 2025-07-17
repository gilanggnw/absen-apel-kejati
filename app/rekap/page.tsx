import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';


const AbsenApelPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Header 
        username="adminverif (Administrator)" 
        logoContent={<h1 className="text-2xl font-semibold text-black">Absen Apel</h1>}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="max-w-7xl mx-auto p-4 flex-1">
            {/* Main Content */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Panel */}
              <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
                <div className="text-lg font-medium text-black">Rekap</div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Pilih Tanggal:</label>
                  <select
                    id="date-picker"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-22B573 focus:ring focus:ring-22B573 focus:ring-opacity-50"
                  >
                    <option>11 Juli 2025</option>
                    {/* Add other dates as needed */}
                  </select>
                </div>
                <div className="mt-6 flex justify-between">
                  <div className="text-sm text-gray-600">
                    <div>Total Pegawai</div>
                    <div className="text-lg font-semibold text-black">400</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Hadir</div>
                    <div className="text-lg font-semibold text-black">259</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Tidak Hadir</div>
                    <div className="text-lg font-semibold text-black">141</div>
                  </div>
                </div>
                <button className="mt-6 w-full py-2 px-4 bg-FFD600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-FFD600">
                  Cetak Laporan
                </button>
              </div>

              {/* Right Panel */}
              <div className="bg-gray-100 rounded-lg p-4 shadow-lg col-span-2 md:col-span-1">
                <div className="text-lg font-medium text-black">Tabel Rekapan</div>
                <div className="mt-4">
                  <p className="text-center text-gray-500">Based on Jam Datang</p>
                  {/* Placeholder for Table */}
                  <div className="mt-4 h-64 bg-gray-200 rounded-lg text-center text-gray-600 flex items-center justify-center">
                    Tabel Rekapan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenApelPage;

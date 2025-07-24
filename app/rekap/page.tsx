'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  getAttendanceForRekap, 
  getRekapStats,
  getDatesWithAttendanceRecordsForRekap,
  type RekapAttendanceRecord,
  type RekapStats 
} from './actions';

// Main Page Component
const AbsenApelPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<RekapAttendanceRecord[]>([]);
  const [stats, setStats] = useState<RekapStats>({
    total: 0,
    present: 0,
    absent: 0,
    onTime: 0,
    late: 0
  });
  const [loading, setLoading] = useState(true);
  const [datesWithAttendance, setDatesWithAttendance] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [records, statsData, availableDates] = await Promise.all([
        getAttendanceForRekap(selectedDate || undefined),
        getRekapStats(selectedDate || undefined),
        getDatesWithAttendanceRecordsForRekap()
      ]);
      setAttendanceRecords(records);
      setStats(statsData);
      setDatesWithAttendance(availableDates);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Load data on component mount and when date changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusStyle = (status: string) => {
    if (status?.toLowerCase().includes('tepat waktu') || 
        (!status?.toLowerCase().includes('telat') && !status?.toLowerCase().includes('terlambat'))) {
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-800"
      };
    } else {
      return {
        bgColor: "bg-red-100", 
        textColor: "text-red-800"
      };
    }
  };

  const handlePrintReport = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get current date for report generation
    const currentDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Determine report title based on selected date
    const reportTitle = selectedDate 
      ? `Laporan Rekap Absensi - ${selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
      : 'Laporan Rekap Absensi - Semua Data';

    // Generate table rows
    const tableRows = attendanceRecords.map((record, index) => {
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${record.nama}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${record.nip}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${formatTimestamp(record.timestamp)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <span style="padding: 4px 8px; background-color: ${record.status?.toLowerCase().includes('tepat waktu') || (!record.status?.toLowerCase().includes('telat') && !record.status?.toLowerCase().includes('terlambat')) ? '#dcfce7' : '#fee2e2'}; color: ${record.status?.toLowerCase().includes('tepat waktu') || (!record.status?.toLowerCase().includes('telat') && !record.status?.toLowerCase().includes('terlambat')) ? '#166534' : '#991b1b'}; border-radius: 9999px; font-size: 12px; font-weight: 600;">
              ${record.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // Create the HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
                size: A4 landscape;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .stats {
              display: flex;
              justify-content: center;
              gap: 40px;
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f5f5f5;
              border-radius: 8px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
            }
            .stat-total { color: #000; }
            .stat-present { color: #16a34a; }
            .stat-absent { color: #dc2626; }
            .stat-ontime { color: #16a34a; }
            .stat-late { color: #ea580c; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f8f9fa;
              padding: 12px 8px;
              border: 1px solid #ddd;
              font-weight: bold;
              text-align: center;
              font-size: 12px;
            }
            td {
              font-size: 11px;
            }
            .footer {
              margin-top: 40px;
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            .no-data {
              text-align: center;
              padding: 40px;
              color: #666;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KEJAKSAAN TINGGI JAWA TENGAH</h1>
            <h2>${reportTitle}</h2>
            <p>Dicetak pada: ${currentDate}</p>
          </div>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-label">Total Pegawai</div>
              <div class="stat-value stat-total">${stats.total}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Hadir</div>
              <div class="stat-value stat-present">${stats.present}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Tidak Hadir</div>
              <div class="stat-value stat-absent">${stats.absent}</div>
            </div>
          </div>

          ${attendanceRecords.length === 0 ? `
            <div class="no-data">
              Tidak ada data untuk ditampilkan
            </div>
          ` : `
            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">No</th>
                  <th style="width: 25%;">Nama Lengkap</th>
                  <th style="width: 20%;">NIP</th>
                  <th style="width: 15%;">Timestamp</th>
                  <th style="width: 15%;">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          `}

          <div class="footer">
            <p>Laporan ini digenerate secara otomatis oleh Sistem Absensi Apel Kejati</p>
            <p>Total Records: ${attendanceRecords.length}</p>
          </div>
        </body>
      </html>
    `;

    // Write content to print window and trigger print
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <Header/>
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
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd MMMM yyyy"
                className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-gray-600 focus:ring focus:ring-gray-200 focus:ring-opacity-50 p-2 pr-10"
                placeholderText="Semua tanggal"
                isClearable
                filterDate={(date) => {
                  // Only allow dates that have attendance records
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateString = `${year}-${month}-${day}`;
                  return datesWithAttendance.includes(dateString);
                }}
              />
              {/* Arrow icon - positioned to avoid overlap with clear button */}
              {!selectedDate && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
            {selectedDate && (
              <div className="ml-4 text-sm text-gray-600">
                Menampilkan data untuk: <span className="font-semibold">{selectedDate.toLocaleDateString('id-ID')}</span>
              </div>
            )}
          </div>

          {/* Stats and Report Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex space-x-6 bg-gray-200 p-6 rounded-lg shadow-inner">
              <div className="text-center">
                <div className="text-gray-600">Total Pegawai</div>
                <div className="text-3xl font-bold text-black">{stats.total}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Hadir</div>
                <div className="text-3xl font-bold text-green-600">{stats.present}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Tidak Hadir</div>
                <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
              </div>
            </div>
            <button 
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              onClick={handlePrintReport}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data kehadiran untuk ditampilkan
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record, index) => {
                    const statusStyle = getStatusStyle(record.status);
                    
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nip}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(record.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AbsenApelPage;

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

// Skeleton Components
const StatsSkeleton = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="flex space-x-6 bg-gray-200 p-6 rounded-lg shadow-inner animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="text-center">
          <div className="h-4 bg-gray-300 rounded mb-2 w-20"></div>
          <div className="h-8 bg-gray-300 rounded w-12"></div>
        </div>
      ))}
    </div>
  </div>
);

const TableSkeleton = () => (
  <div>
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-300 rounded w-48"></div>
      <div className="h-10 bg-gray-300 rounded w-32"></div>
    </div>
    
    {/* Table skeleton */}
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded"></div>
            </th>
            <th className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded"></div>
            </th>
            <th className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded"></div>
            </th>
            <th className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded"></div>
            </th>
            <th className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded"></div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-8"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-6 bg-gray-300 rounded-full w-24"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Stats Display Component  
const StatsDisplay = ({ stats, loading, selectedDate }: { stats: RekapStats, loading: boolean, selectedDate: Date | null }) => {
  if (loading) return <StatsSkeleton />;

  const displayValue = (value: number) => selectedDate ? value : '-';

  return (
    <div className="flex flex-col items-center justify-center mb-8">
      {!selectedDate && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-800 font-medium">
              Silakan pilih tanggal untuk melihat statistik kehadiran per hari
            </p>
          </div>
        </div>
      )}
      <div className="flex space-x-6 bg-gray-200 p-6 rounded-lg shadow-inner">
        <div className="text-center">
          <div className="text-gray-600">Total Pegawai</div>
          <div className="text-3xl font-bold text-black">{displayValue(stats.total)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Hadir</div>
          <div className="text-3xl font-bold text-green-600">{displayValue(stats.present)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Tidak Hadir</div>
          <div className="text-3xl font-bold text-red-600">{displayValue(stats.absent)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Tepat Waktu</div>
          <div className="text-3xl font-bold text-green-600">{displayValue(stats.onTime)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Terlambat</div>
          <div className="text-3xl font-bold text-red-800">{displayValue(stats.late)}</div>
        </div>
      </div>
    </div>
  );
};

// Attendance Table Component
const AttendanceTable = ({ 
  records, 
  loading, 
  selectedDate,
  currentPage,
  totalRecords,
  onPageChange,
  onPrintReport 
}: { 
  records: RekapAttendanceRecord[], 
  loading: boolean,
  selectedDate: Date | null,
  currentPage: number,
  totalRecords: number,
  onPageChange: (page: number) => void,
  onPrintReport: () => void
}) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
    const dateString = date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeString = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `${dayName}, ${dateString} - ${timeString}`;
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

  const totalPages = Math.ceil(totalRecords / 10);

  if (loading) return <TableSkeleton />;

  return (
    <div>
      {/* Header with Print Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Daftar Kehadiran</h2>
        <button 
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          onClick={onPrintReport}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak Laporan
        </button>
      </div>

      {selectedDate && (
        <p className="text-sm text-gray-600 mb-4">
          Data untuk: {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
      
      {/* Table with verifikasi page styling */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waktu Absen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {selectedDate ? 'Tidak ada data kehadiran untuk tanggal yang dipilih' : 'Tidak ada data kehadiran'}
                </td>
              </tr>
            ) : (
              records.map((record, index) => {
                const { bgColor, textColor } = getStatusStyle(record.status);
                const displayIndex = (currentPage - 1) * 10 + index + 1;
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {displayIndex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.nip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(record.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
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
      
      {/* Pagination with verifikasi page styling */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * 10 + 1, totalRecords)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, totalRecords)}</span> of{' '}
                <span className="font-medium">{totalRecords}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const startPage = Math.max(1, currentPage - 2);
                  const pageNumber = startPage + i;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNumber === currentPage
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline-2'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                      } ${i === 0 ? 'rounded-l-md' : ''} ${i === Math.min(5, totalPages) - 1 ? 'rounded-r-md' : ''}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Page Component
const AbsenApelPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintMonth, setSelectedPrintMonth] = useState<string>('');

  // React Query for attendance records with pagination
  const { 
    data: attendanceData, 
    isLoading: attendanceLoading
  } = useQuery({
    queryKey: ['rekap-attendance', selectedDate, currentPage],
    queryFn: () => getAttendanceForRekap(selectedDate || undefined, currentPage, 10),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for stats
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['rekap-stats', selectedDate],
    queryFn: () => getRekapStats(selectedDate || undefined),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for available dates
  const { 
    data: datesWithAttendance 
  } = useQuery({
    queryKey: ['rekap-dates'],
    queryFn: getDatesWithAttendanceRecordsForRekap,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Extract data with defaults
  const attendanceRecords = attendanceData?.records || [];
  const totalRecords = attendanceData?.total || 0;
  const statsData = stats || {
    total: 0,
    present: 0,
    absent: 0,
    onTime: 0,
    late: 0
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
    const dateString = date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeString = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `${dayName}, ${dateString} - ${timeString}`;
  };

  const handlePrintReport = () => {
    setShowPrintModal(true);
  };

  const handleConfirmPrint = async () => {
    if (!selectedPrintMonth) {
      alert('Silakan pilih bulan terlebih dahulu');
      return;
    }

    try {
      // Show loading state or disable button to prevent multiple clicks
      const printButton = document.querySelector('[data-print-button]') as HTMLButtonElement;
      if (printButton) {
        printButton.disabled = true;
        printButton.textContent = 'Memproses...';
      }

      // Parse the selected month (format: "YYYY-MM")
      const [year, month] = selectedPrintMonth.split('-');

      // Optimized: Get monthly data more efficiently by fetching larger batches
      // and filtering based on available dates instead of day-by-day requests
      const monthlyRecords: RekapAttendanceRecord[] = [];
      let monthlyStats = {
        total: 0,
        present: 0,
        absent: 0,
        onTime: 0,
        late: 0
      };

      // Filter available dates for the selected month
      const monthDates = datesWithAttendance?.filter(dateString => {
        const [dateYear, dateMonth] = dateString.split('-');
        return dateYear === year && dateMonth === month.padStart(2, '0');
      }) || [];

      // Batch fetch data for all days that have attendance records
      const batchPromises = monthDates.map(async (dateString) => {
        const [y, m, d] = dateString.split('-');
        const dayDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return getAttendanceForRekap(dayDate, 1, 1000);
      });

      // Execute all requests in parallel instead of sequentially
      const batchResults = await Promise.all(batchPromises);
      
      // Combine all records
      batchResults.forEach(result => {
        if (result?.records) {
          monthlyRecords.push(...result.records);
        }
      });

      // Get stats more efficiently - just get it once for any day in the month
      if (monthDates.length > 0) {
        const [firstYear, firstMonth, firstDay] = monthDates[0].split('-');
        const sampleDate = new Date(parseInt(firstYear), parseInt(firstMonth) - 1, parseInt(firstDay));
        const firstDayStats = await getRekapStats(sampleDate);
        const uniqueAttendees = new Set(monthlyRecords.map(r => r.nip));
        
        monthlyStats = {
          total: firstDayStats.total,
          present: uniqueAttendees.size,
          absent: firstDayStats.total - uniqueAttendees.size,
          onTime: monthlyRecords.filter(r => 
            r.status?.toLowerCase().includes('tepat waktu') || 
            (!r.status?.toLowerCase().includes('telat') && !r.status?.toLowerCase().includes('terlambat'))
          ).length,
          late: monthlyRecords.filter(r => 
            r.status?.toLowerCase().includes('telat') || 
            r.status?.toLowerCase().includes('terlambat')
          ).length,
        };
      }

      // Create print content immediately after data is ready
      // Instead of opening a new window, create a hidden iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-10000px';
      printFrame.style.left = '-10000px';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!frameDoc) {
        // Re-enable button if frame creation fails
        if (printButton) {
          printButton.disabled = false;
          printButton.textContent = 'Cetak Laporan';
        }
        document.body.removeChild(printFrame);
        return;
      }

      // Get current date for report generation
      const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Format the month name for display
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthName = monthNames[parseInt(month) - 1];
      const reportTitle = `Laporan Rekap Absensi - ${monthName} ${year}`;

      // Generate table rows for all records in the month
      const tableRows = monthlyRecords.map((record, index) => {
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
              }
              .stats {
                display: flex;
                justify-content: space-around;
                margin: 30px 0;
                background-color: #f8f9fa;
                padding: 20px;
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
              .stat-total { color: #333; }
              .stat-present { color: #22c55e; }
              .stat-absent { color: #ef4444; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                padding: 12px 8px;
                border: 1px solid #ddd;
                text-align: left;
              }
              th {
                background-color: #f8f9fa;
                font-weight: bold;
                text-align: center;
              }
              .footer {
                margin-top: 40px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${reportTitle}</h1>
              <p>Tanggal Cetak: ${currentDate}</p>
            </div>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-label">Total Pegawai</div>
                <div class="stat-value stat-total">${monthlyStats?.total || 0}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Hadir</div>
                <div class="stat-value stat-present">${monthlyStats?.present || 0}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Tidak Hadir</div>
                <div class="stat-value stat-absent">${monthlyStats?.absent || 0}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Tepat Waktu</div>
                <div class="stat-value stat-present">${monthlyStats?.onTime || 0}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Terlambat</div>
                <div class="stat-value stat-absent">${monthlyStats?.late || 0}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">No</th>
                  <th style="width: 30%;">Nama</th>
                  <th style="width: 15%;">NIP</th>
                  <th style="width: 30%;">Waktu Absen</th>
                  <th style="width: 20%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>

            <div class="footer">
              <p>Total Records: ${monthlyRecords?.length || 0}</p>
              <p>Periode: ${monthName} ${year}</p>
            </div>
          </body>
        </html>
      `;

      // Write content to iframe and trigger print immediately
      frameDoc.write(printContent);
      frameDoc.close();
      
      // Trigger print immediately without waiting for onload
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      
      // Clean up the iframe after a short delay
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1000);
      
      // Close the modal immediately
      setShowPrintModal(false);
      setSelectedPrintMonth('');

      // Re-enable button
      if (printButton) {
        printButton.disabled = false;
        printButton.textContent = 'Cetak Laporan';
      }

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Terjadi kesalahan saat membuat laporan');
      
      // Re-enable button on error
      const printButton = document.querySelector('[data-print-button]') as HTMLButtonElement;
      if (printButton) {
        printButton.disabled = false;
        printButton.textContent = 'Cetak Laporan';
      }
      
      // Clean up any created iframe
      const existingFrame = document.querySelector('iframe[style*="position: absolute"]') as HTMLIFrameElement;
      if (existingFrame && document.body.contains(existingFrame)) {
        document.body.removeChild(existingFrame);
      }
    }
  };

  const handleCancelPrint = () => {
    setShowPrintModal(false);
    setSelectedPrintMonth('');
  };

  // Generate month options based on available attendance data
  const generateMonthOptions = () => {
    if (!datesWithAttendance || datesWithAttendance.length === 0) return [];
    
    const monthsWithData = new Set<string>();
    
    // Extract unique year-month combinations from available dates
    datesWithAttendance.forEach(dateString => {
      const [year, month] = dateString.split('-');
      monthsWithData.add(`${year}-${month}`);
    });
    
    // Convert to array and sort in descending order (newest first)
    const sortedMonths = Array.from(monthsWithData).sort((a, b) => b.localeCompare(a));
    
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return sortedMonths.map(yearMonth => {
      const [year, month] = yearMonth.split('-');
      const monthName = monthNames[parseInt(month) - 1];
      
      return {
        value: yearMonth,
        label: `${monthName} ${year}`
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      <Header/>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center mb-6">
            <label htmlFor="date-picker" className="text-lg font-medium text-gray-700 mr-4">
              Pilih Tanggal:
            </label>
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
                  if (!datesWithAttendance) return true;
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateString = `${year}-${month}-${day}`;
                  return datesWithAttendance.includes(dateString);
                }}
              />
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

          <StatsDisplay stats={statsData} loading={statsLoading} selectedDate={selectedDate} />

          <AttendanceTable 
            records={attendanceRecords} 
            loading={attendanceLoading} 
            selectedDate={selectedDate}
            currentPage={currentPage}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
            onPrintReport={handlePrintReport}
          />
        </main>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cetak Laporan Bulanan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pilih bulan untuk mencetak laporan kehadiran:
            </p>
            
            <div className="mb-6">
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">
                Bulan:
              </label>
              {generateMonthOptions().length === 0 ? (
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                  Tidak ada data kehadiran yang tersedia
                </div>
              ) : (
                <select
                  id="month-select"
                  value={selectedPrintMonth}
                  onChange={(e) => setSelectedPrintMonth(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Bulan --</option>
                  {generateMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelPrint}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPrint}
                disabled={!selectedPrintMonth || generateMonthOptions().length === 0}
                data-print-button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cetak Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenApelPage;

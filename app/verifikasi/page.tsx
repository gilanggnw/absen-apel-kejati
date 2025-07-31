'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getAttendanceForVerification, 
  updateVerificationStatus, 
  getAttendanceStats,
  getDatesWithAttendanceRecords,
  getAttendancePhotos,
  type AttendanceRecord
} from './actions';

// Loading skeleton component
const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="min-w-full divide-y divide-gray-200">
      <div className="bg-gray-50 p-6">
        <div className="flex space-x-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="bg-white divide-y divide-gray-200">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-6">
            <div className="flex space-x-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Pagination component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    page === currentPage
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline-2'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const VerifikasiPage = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPhotos, setLoadedPhotos] = useState<Map<string, { photo: string | null; employeePhoto: string | null }>>(new Map());

  // React Query hooks for data fetching with optimized cache settings
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-verification', selectedDate?.toISOString(), currentPage],
    queryFn: () => getAttendanceForVerification(selectedDate || undefined, currentPage, 10),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });

  const { data: stats } = useQuery<{ total: number; approved: number; pending: number; rejected: number }>({
    queryKey: ['attendance-stats'],
    queryFn: getAttendanceStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
  });

  const { data: datesWithAttendance } = useQuery<string[]>({
    queryKey: ['dates-attendance'],
    queryFn: getDatesWithAttendanceRecords,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
  });

  // Extracted data with defaults
  const attendanceRecords = attendanceData?.records || [];
  const totalPages = attendanceData?.totalPages || 0;
  const statsData = stats || { total: 0, approved: 0, pending: 0, rejected: 0 };
  const datesWithAttendanceData: string[] = datesWithAttendance || [];

  const handleVerifikasiClick = async (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowDialog(true);
    
    // Lazy load photos only when dialog is opened
    if (record.id && !loadedPhotos.has(record.id)) {
      try {
        const photos = await getAttendancePhotos(record.id);
        setLoadedPhotos(prev => new Map(prev.set(record.id, photos)));
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedRecord(null);
  };

  const handleApprove = async () => {
    if (!selectedRecord || !session?.user?.id) return;

    try {
      const result = await updateVerificationStatus(
        selectedRecord.id,
        'approved',
        session.user.id
      );

      if (result.success) {
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['attendance-verification'] });
        queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
        queryClient.invalidateQueries({ queryKey: ['dates-pending'] });
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error approving record:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRecord || !session?.user?.id) return;

    try {
      const result = await updateVerificationStatus(
        selectedRecord.id,
        'rejected',
        session.user.id
      );

      if (result.success) {
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['attendance-verification'] });
        queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
        queryClient.invalidateQueries({ queryKey: ['dates-pending'] });
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error rejecting record:', error);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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

  const getKetepatanWaktu = (status: string) => {
    if (status.toLowerCase().includes('telat') || status.toLowerCase().includes('terlambat')) {
      return { text: 'Terlambat', bgColor: 'bg-red-200', textColor: 'text-red-800' };
    }
    return { text: 'Tepat Waktu', bgColor: 'bg-green-200', textColor: 'text-green-800' };
  };

  const getVerifiedStatus = (verifiedStatus: string) => {
    switch (verifiedStatus) {
      case 'approved':
        return { text: 'Diterima', bgColor: 'bg-green-200', textColor: 'text-green-800', disabled: true };
      case 'rejected':
        return { text: 'Ditolak', bgColor: 'bg-red-200', textColor: 'text-red-800', disabled: true };
      default:
        return { text: 'Verifikasi!', bgColor: '', textColor: '', disabled: false };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      <Header />
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
                  if (!datesWithAttendanceData) return true;
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateString = `${year}-${month}-${day}`;
                  return datesWithAttendanceData.includes(dateString);
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

          {/* Stats */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex space-x-6 bg-gray-200 p-6 rounded-lg shadow-inner">
              <div className="text-center">
                <div className="text-gray-600">Total Data</div>
                <div className="text-3xl font-bold text-black">{statsData.total}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Terverifikasi</div>
                <div className="text-3xl font-bold text-green-600">{statsData.approved}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Menunggu</div>
                <div className="text-3xl font-bold text-red-600">{statsData.pending}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Ditolak</div>
                <div className="text-3xl font-bold text-red-800">{statsData.rejected}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          {attendanceLoading ? (
            <TableSkeleton />
          ) : (
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
                          Hari, Tanggal & Jam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ketepatan Waktu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                      </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No attendance records found
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((record: AttendanceRecord, index: number) => {
                        const ketepatanWaktu = getKetepatanWaktu(record.status);
                        const verifiedStatus = getVerifiedStatus(record.verified_status);
                        
                        return (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(currentPage - 1) * 10 + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.nama}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.nip}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTimestamp(record.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ketepatanWaktu.bgColor} ${ketepatanWaktu.textColor}`}>
                                {ketepatanWaktu.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {verifiedStatus.disabled ? (
                                <span className={`px-3 py-2 text-xs font-semibold rounded-lg ${verifiedStatus.bgColor} ${verifiedStatus.textColor}`}>
                                  {verifiedStatus.text}
                                </span>
                              ) : (
                                <button 
                                  className="px-3 py-2 text-sm font-bold rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                  onClick={() => handleVerifikasiClick(record)}
                                >
                                  Verifikasi!
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
              </table>
              
              {/* Pagination */}
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

        {/* Dialog Modal */}
        {showDialog && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.75)' }}>
            <div className="bg-white rounded-lg shadow-xl p-10 w-full max-w-2xl relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold" onClick={handleCloseDialog}>&times;</button>
              <h2 className="text-2xl font-bold mb-8 text-center">Verifikasi Pegawai</h2>
              
              {/* Employee Info */}
              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold">{selectedRecord.nama}</h3>
                <p className="text-gray-600">NIP: {selectedRecord.nip}</p>
                <p className="text-gray-600">Waktu: {formatTimestamp(selectedRecord.timestamp)}</p>
              </div>
              
              <div className="flex justify-center gap-8 mb-10">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Absensi</h4>
                  {(() => {
                    const photos = loadedPhotos.get(selectedRecord.id);
                    if (!photos) {
                      return (
                        <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                        </div>
                      );
                    }
                    if (photos.photo) {
                      return (
                        <div className="w-56 h-56 bg-gray-200 rounded-lg overflow-hidden">
                          <Image 
                            src={photos.photo}
                            alt="Attendance Photo"
                            width={224}
                            height={224}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">
                        No Photo Available
                      </div>
                    );
                  })()}
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Profile</h4>
                  {(() => {
                    const photos = loadedPhotos.get(selectedRecord.id);
                    if (!photos) {
                      return (
                        <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                        </div>
                      );
                    }
                    if (photos.employeePhoto) {
                      return (
                        <div className="w-56 h-56 bg-gray-200 rounded-lg overflow-hidden">
                          <Image 
                            src={photos.employeePhoto}
                            alt="Employee Profile Photo"
                            width={224}
                            height={224}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">
                        No Profile Photo
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div className="flex justify-center gap-6 mt-4">
                <button 
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-all duration-200"
                  onClick={handleApprove}
                >
                  Approve
                </button>
                <button 
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-all duration-200"
                  onClick={handleReject}
                >
                  Decline
                </button>
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

'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  getAttendanceForVerification, 
  updateVerificationStatus, 
  getAttendanceStats,
  getDatesWithPendingRequests,
  getDatesWithAttendanceRecords,
  type AttendanceRecord 
} from './actions';

// Main Page Component
const VerifikasiPage = () => {
  const { data: session } = useSession();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [datesWithPending, setDatesWithPending] = useState<string[]>([]);
  const [datesWithAttendance, setDatesWithAttendance] = useState<string[]>([]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [records, statsData, pendingDates, availableDates] = await Promise.all([
        getAttendanceForVerification(selectedDate || undefined),
        getAttendanceStats(),
        getDatesWithPendingRequests(),
        getDatesWithAttendanceRecords()
      ]);
      setAttendanceRecords(records);
      setStats(statsData);
      setDatesWithPending(pendingDates);
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

  const handleVerifikasiClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowDialog(true);
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
        await loadData(); // Reload data
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
        await loadData(); // Reload data
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error rejecting record:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
        return { text: 'Diterima', bgColor: 'bg-green-600', textColor: 'text-white', disabled: true };
      case 'rejected':
        return { text: 'Ditolak', bgColor: 'bg-red-600', textColor: 'text-white', disabled: true };
      default:
        return { text: 'Verifikasi!', bgColor: '', textColor: '', disabled: false };
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };
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
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd MMMM yyyy"
                className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-gray-600 focus:ring focus:ring-gray-200 focus:ring-opacity-50 p-2 pr-16"
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
                renderDayContents={(day, date) => {
                  if (!date) return day;
                  
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(date.getDate()).padStart(2, '0');
                  const dateString = `${year}-${month}-${dayStr}`;
                  
                  const hasPending = datesWithPending.includes(dateString);
                  const hasAttendance = datesWithAttendance.includes(dateString);
                  
                  return (
                    <div 
                      style={{ 
                        position: 'relative', 
                        display: 'inline-block',
                        opacity: hasAttendance ? 1 : 0.3,
                        color: hasAttendance ? 'inherit' : '#9ca3af'
                      }}
                    >
                      {day}
                      {hasPending && hasAttendance && (
                        <span 
                          style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            color: '#dc2626',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}
                        >
                          !
                        </span>
                      )}
                    </div>
                  );
                }}
              />
              {/* Arrow icon - positioned to avoid overlap with clear button */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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
                <div className="text-gray-600">Terverifikasi</div>
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Menunggu</div>
                <div className="text-3xl font-bold text-red-600">{stats.pending}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Ditolak</div>
                <div className="text-3xl font-bold text-red-800">{stats.rejected}</div>
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((record, index) => {
                      const ketepatanWaktu = getKetepatanWaktu(record.status);
                      const verifiedStatus = getVerifiedStatus(record.verified_status);
                      
                      return (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nip}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTimestamp(record.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ketepatanWaktu.bgColor} ${ketepatanWaktu.textColor}`}>
                              {ketepatanWaktu.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {verifiedStatus.disabled ? (
                              <button 
                                className={`px-2 py-1 text-xs font-semibold rounded-full cursor-not-allowed ${verifiedStatus.bgColor} ${verifiedStatus.textColor}`} 
                                disabled
                              >
                                {verifiedStatus.text}
                              </button>
                            ) : (
                              <button 
                                className="px-3 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl border-2 border-blue-300" 
                                onClick={() => handleVerifikasiClick(record)}
                              >
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {verifiedStatus.text}
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
            </table>
          </div>

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
                  {selectedRecord.photo ? (
                    <div className="w-56 h-56 bg-gray-200 rounded-lg overflow-hidden">
                      <Image 
                        src={selectedRecord.photo}
                        alt="Attendance Photo"
                        width={224}
                        height={224}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">
                      No Photo Available
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Profile</h4>
                  {selectedRecord.employeePhoto ? (
                    <div className="w-56 h-56 bg-gray-200 rounded-lg overflow-hidden">
                      <Image 
                        src={selectedRecord.employeePhoto}
                        alt="Employee Profile Photo"
                        width={224}
                        height={224}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-base">
                      No Profile Photo
                    </div>
                  )}
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

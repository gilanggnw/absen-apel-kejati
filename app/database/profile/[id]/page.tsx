'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NextImage from 'next/image';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getEmployeeById, getAttendanceHistoryByNip, type AttendanceHistoryRecord } from '../../actions';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';

interface ImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    onError?: React.ReactEventHandler<HTMLImageElement>;
}

const Image = ({ src, alt, width, height, className, onError }: ImageProps) => (
    <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={onError}
        unoptimized
    />
)
// --- Page Specific Components ---

// Employee Info Card
interface Employee {
    id: number;
    nama: string;
    nip: string;
    jabatan: string | null;
    pangkat: string | null;
    status: string;
    imageUrl?: string;
}

const EmployeeInfo = ({ employee }: { employee: Employee }) => (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-lg border mb-8 gap-6">
        <div className="w-full md:w-auto">
            <h2 className="text-lg font-bold mb-4">Informasi Pegawai</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <span className="font-semibold text-gray-700">Nama Pegawai:</span>
                <span className="text-black">{employee.nama}</span>
                <span className="font-semibold text-gray-700">NIP:</span>
                <span className="text-black">{employee.nip}</span>
                <span className="font-semibold text-gray-700">Jabatan:</span>
                <span className="text-black">{employee.jabatan || '-'}</span>
                <span className="font-semibold text-gray-700">Pangkat:</span>
                <span className="text-black">{employee.pangkat || '-'}</span>
                <span className="font-semibold text-gray-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    employee.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {employee.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                </span>
            </div>
        </div>
        <Image
            src={employee.imageUrl || `https://placehold.co/128x128/334155/ffffff?text=${employee.nama.charAt(0)}`}
            alt="Profile"
            width={128}
            height={128}
            className="w-32 h-32 rounded-lg object-cover shadow-lg ring-2 ring-gray-300"
            onError={(e) => { e.currentTarget.src='https://placehold.co/128x128/e2e8f0/4a5568?text=Photo'; }}
        />
    </div>
);

// Attendance Table
const AttendanceTable = ({ records, loading }: { records: AttendanceHistoryRecord[], loading: boolean }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-lg font-bold mb-4">Riwayat Kehadiran</h2>
        <div className="hidden md:grid grid-cols-4 gap-4 text-center font-semibold text-gray-700 mb-4">
            <div>Tanggal</div>
            <div>Waktu</div>
            <div>Status Kehadiran</div>
            <div>Status Verifikasi</div>
        </div>
        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-8 text-gray-500">
                    Memuat riwayat kehadiran...
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Belum ada riwayat kehadiran untuk bulan yang dipilih
                </div>
            ) : (
                records.map((record, index) => (
                    <div
                        key={record.id}
                        className={`grid grid-cols-4 gap-4 text-center items-center rounded-lg py-3 px-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition`}
                    >
                        <div className="text-black">{record.date}</div>
                        <div className="text-black">{record.time}</div>
                        <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                record.status.toLowerCase().includes('hadir') 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {record.status}
                            </span>
                        </div>
                        <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                record.verified_status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : record.verified_status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {record.verified_status === 'approved' ? 'Disetujui' : 
                                 record.verified_status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

// --- Main Page Component ---
const ProfilePage = () => {
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;
    
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date(2025, 6));
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceHistoryRecord[]>([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Fetch employee data
    useEffect(() => {
        const fetchEmployee = async () => {
            if (employeeId) {
                setLoading(true);
                try {
                    const data = await getEmployeeById(parseInt(employeeId));
                    if (data) {
                        setEmployee({
                            id: data.id,
                            nama: data.nama,
                            nip: data.nip,
                            jabatan: data.jabatan,
                            pangkat: data.pangkat,
                            status: data.status || 'aktif', // Use actual status from database
                            imageUrl: data.foto || undefined,
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch employee:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchEmployee();
    }, [employeeId]);

    // Fetch attendance data based on selected month
    const fetchAttendanceData = React.useCallback(async () => {
        if (!employee?.nip) return;

        setAttendanceLoading(true);
        try {
            let startDate, endDate;
            
            if (selectedMonth) {
                // Get start and end of the selected month
                startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
                endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
            }

            const records = await getAttendanceHistoryByNip(employee.nip, startDate, endDate);
            setAttendanceRecords(records);
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
            setAttendanceRecords([]);
        } finally {
            setAttendanceLoading(false);
        }
    }, [employee?.nip, selectedMonth]);

    // Fetch attendance data when employee or selected month changes
    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
                <Header />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-xl text-gray-600">Loading...</div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
                <Header />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-xl text-red-600">Employee not found</div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => router.push('/database')}
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            ← Kembali ke Database
                        </button>
                        <button
                            onClick={() => router.push(`/database/profile/${employeeId}/edit`)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        >
                            Edit Data
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold mb-6">Profile Pegawai</h1>
                    <div className="flex flex-wrap gap-6 mb-8">
                        <div className="flex items-center bg-white border-2 border-yellow-400 rounded-xl shadow-md px-6 py-4 relative">
                            <label className="text-lg font-medium text-gray-700 mr-4">
                                Pilih Bulan & Tahun:
                            </label>
                            <div className="relative w-44">
                                <DatePicker
                                    selected={selectedMonth}
                                    onChange={(date: Date | null) => setSelectedMonth(date)}
                                    dateFormat="MMMM yyyy"
                                    showMonthYearPicker
                                    showYearDropdown
                                    yearDropdownItemNumber={5}
                                    scrollableYearDropdown
                                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 font-semibold text-gray-800 focus:ring-yellow-400 focus:border-yellow-400 cursor-pointer bg-gray-50 hover:bg-yellow-50 transition"
                                    placeholderText="Pilih bulan & tahun"
                                    isClearable
                                />
                            </div>
                        </div>
                    </div>

                    <EmployeeInfo employee={employee} />
                    <AttendanceTable records={attendanceRecords} loading={attendanceLoading} />
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;

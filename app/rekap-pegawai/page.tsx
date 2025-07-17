'use client';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Image from 'next/image';

// --- Page Specific Components ---

// Employee Info Card
interface Employee {
    name: string;
    nip: string;
    dob: string;
    imageUrl: string;
}


const EmployeeInfo = ({ employee }: { employee: Employee }) => (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-lg border mb-8 gap-6">
        <div className="w-full md:w-auto">
            <h2 className="text-lg font-bold mb-4">Informasi Pegawai</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <span className="font-semibold text-gray-700">Nama Pegawai:</span>
                <span className="text-black">{employee.name}</span>
                <span className="font-semibold text-gray-700">NIP:</span>
                <span className="text-black">{employee.nip}</span>
                <span className="font-semibold text-gray-700">Tanggal Lahir:</span>
                <span className="text-black">{employee.dob}</span>
            </div>
        </div>
        <Image
            src={employee.imageUrl}
            alt="Profile"
            width={128}
            height={128}
            className="w-32 h-32 rounded-lg object-cover shadow-lg ring-2 ring-gray-300"
            onError={(e) => { e.currentTarget.src='https://placehold.co/128x128/e2e8f0/4a5568?text=Photo'; }}
        />
    </div>
);

// Attendance Table
interface AttendanceRecord {
    date: string;
    status: string;
    photoAndTime: string;
}


const AttendanceTable = ({ records }: { records: AttendanceRecord[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-lg font-bold mb-4">Riwayat Kehadiran</h2>
        <div className="hidden md:grid grid-cols-3 gap-4 text-center font-semibold text-gray-700 mb-4">
            <div>Tanggal</div>
            <div>Status Kehadiran</div>
            <div>Foto dan Jam</div>
        </div>
        <div className="space-y-4">
            {records.map((record, index) => (
                <div
                    key={index}
                    className={`grid grid-cols-3 gap-4 text-center items-center rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition`}
                >
                    <div className="text-black py-2">{record.date}</div>
                    <div className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${record.status.includes('Hadir') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                            {record.status}
                        </span>
                    </div>
                    <div className="text-black py-2">{record.photoAndTime}</div>
                </div>
            ))}
        </div>
    </div>
);


// --- Main Page Component ---
const RekapPegawaiPage = () => {
    // Mock data based on the image
    const employeeData = {
        name: 'mamang kesbor',
        nip: '170845',
        dob: '17 Agustus 1945',
        imageUrl: 'https://placehold.co/128x128/334155/ffffff?text=MK', // Placeholder image
    };

    const attendanceData = [
        { date: '7 Juli 2025', status: 'Hadir', photoAndTime: 'foto (07:09)' },
        { date: '14 Juli 2025', status: 'Absen', photoAndTime: 'blank' },
        { date: '21 Juli 2025', status: 'Hadir (telat)', photoAndTime: 'foto (07:50)' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
            <Header
                username="superadmin (Administrator)"
                logoContent={<h1 className="text-3xl font-bold text-black">Absen Apel</h1>}
            />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold mb-6">Rekap Pegawai</h1>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-6 mb-8">
                        <div className="flex items-center">
                            <label htmlFor="month-picker" className="text-lg font-medium text-gray-700 mr-4">
                                Pilih Bulan:
                            </label>
                            <select id="month-picker" className="block w-40 rounded-md border-gray-300 shadow-sm p-2">
                                <option>Juli</option>
                                <option>Agustus</option>
                                <option>September</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="year-picker" className="text-lg font-medium text-gray-700 mr-4">
                                Pilih Tahun:
                            </label>
                            <select id="year-picker" className="block w-32 rounded-md border-gray-300 shadow-sm p-2">
                                <option>2025</option>
                                <option>2024</option>
                                <option>2023</option>
                            </select>
                        </div>
                    </div>

                    {/* Employee Info */}
                    <EmployeeInfo employee={employeeData} />

                    {/* Attendance Table */}
                    <AttendanceTable records={attendanceData} />
                </main>
            </div>
        </div>
    );
};

export default RekapPegawaiPage;

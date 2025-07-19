
'use client';

import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// --- Helper Components & Icons ---

// Icon for the Edit action
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 hover:text-blue-700">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

// Icon for the Delete action
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 hover:text-red-700">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// --- Mock Data ---

// Type definition for an employee
type Employee = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  status: 'Aktif' | 'Tidak Aktif';
};

// Sample employee data
const mockEmployees: Employee[] = [
  { id: 1, nama: 'Budi Santoso', nip: '198503152010011001', jabatan: 'Kepala Bagian', status: 'Aktif' },
  { id: 2, nama: 'Citra Lestari', nip: '199008202015032002', jabatan: 'Staf Administrasi', status: 'Aktif' },
  { id: 3, nama: 'Agus Wijaya', nip: '198812012014021003', jabatan: 'Analis Keuangan', status: 'Aktif' },
  { id: 4, nama: 'Dewi Anggraini', nip: '199205102018012005', jabatan: 'Staf IT', status: 'Tidak Aktif' },
  { id: 5, nama: 'Eko Prasetyo', nip: '198707252012061004', jabatan: 'Staf Pemasaran', status: 'Aktif' },
  { id: 6, nama: 'Fitriani', nip: '199501302020032007', jabatan: 'Staf HRD', status: 'Aktif' },
];


// --- Main Database Page Component ---

const DatabasePage = () => {
  // State for the list of employees
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  // State for the search filter
  const [searchTerm, setSearchTerm] = useState('');
  // State for the status filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Tidak Aktif'>('all');

  // Dialog state for tambah pegawai
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    pangkat: '',
    status: 'Aktif',
  });

  // Memoized filtering logic to avoid re-calculating on every render
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(employee => {
        // Filter by status
        if (statusFilter !== 'all' && employee.status !== statusFilter) {
          return false;
        }
        // Filter by search term (case-insensitive search on name and NIP)
        if (searchTerm && 
            !employee.nama.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !employee.nip.includes(searchTerm)) {
          return false;
        }
        return true;
      });
  }, [employees, searchTerm, statusFilter]);

  // --- CRUD Action Handlers (with console logs for demonstration) ---

  const handleAddEmployee = () => {
    setShowAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setShowAddDialog(false);
    setFormData({ nip: '', nama: '', jabatan: '', pangkat: '', status: 'Aktif' });
  };

  const handleAddDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmployee: Employee = {
      id: newId,
      nama: formData.nama,
      nip: formData.nip,
      jabatan: formData.jabatan,
      status: formData.status as 'Aktif' | 'Tidak Aktif',
    };
    setEmployees([...employees, newEmployee]);
    handleAddDialogClose();
  };

  const handleEdit = (id: number) => {
    // In a real app, this would navigate to an edit page or open a modal
    console.log(`Action: Edit employee with ID ${id}`);
  };

  const handleDelete = (id: number) => {
    // In a real app, this would show a confirmation dialog first
    console.log(`Action: Delete employee with ID ${id}`);
    setEmployees(employees.filter(employee => employee.id !== id));
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg relative">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 border-gray-200">
              <h1 className="text-3xl font-bold text-gray-800">Database Pegawai</h1>
              <button
                onClick={handleAddEmployee}
                className="mt-4 sm:mt-0 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                + Tambah Pegawai
              </button>
            </div>

            {/* Dialog for tambah pegawai */}
            {showAddDialog && (
              <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.35)' }}>
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-left relative">
                  <h2 className="text-2xl font-bold mb-6 text-black">Tambah Pegawai Baru</h2>
                  <form onSubmit={handleAddDialogSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">NIP</label>
                      <input
                        type="text"
                        required
                        value={formData.nip}
                        onChange={e => setFormData(f => ({ ...f, nip: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black placeholder:opacity-70"
                        placeholder="Masukkan NIP"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Nama</label>
                      <input
                        type="text"
                        required
                        value={formData.nama}
                        onChange={e => setFormData(f => ({ ...f, nama: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black placeholder:opacity-70"
                        placeholder="Masukkan Nama"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Jabatan</label>
                      <input
                        type="text"
                        value={formData.jabatan}
                        onChange={e => setFormData(f => ({ ...f, jabatan: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black placeholder:opacity-70"
                        placeholder="Masukkan Jabatan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Pangkat</label>
                      <input
                        type="text"
                        value={formData.pangkat}
                        onChange={e => setFormData(f => ({ ...f, pangkat: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black placeholder:opacity-70"
                        placeholder="Masukkan Pangkat"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-black opacity-80"
                      >
                        <option value="Aktif" className="text-black opacity-80">Aktif</option>
                        <option value="Tidak Aktif" className="text-black opacity-80">Tidak Aktif</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleAddDialogClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black placeholder:text-black placeholder:opacity-70"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black opacity-80"
              >
                <option value="all" className="text-black opacity-80">Semua Status</option>
                <option value="Aktif" className="text-black opacity-80">Aktif</option>
                <option value="Tidak Aktif" className="text-black opacity-80">Tidak Aktif</option>
              </select>
            </div>

            {/* Employee Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">NIP</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Jabatan</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.nama}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{employee.nip}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.jabatan}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <div className="flex justify-center items-center gap-4">
                            <button onClick={() => handleEdit(employee.id)} className="focus:outline-none" aria-label="Edit">
                              <EditIcon />
                            </button>
                            <button onClick={() => handleDelete(employee.id)} className="focus:outline-none" aria-label="Delete">
                              <DeleteIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500">
                        Tidak ada data yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DatabasePage;
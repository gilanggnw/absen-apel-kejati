'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getEmployees, addEmployee, deleteEmployee, type DatabaseEmployee } from './actions';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// --- Helper Components & Icons ---

// Loading skeleton component
const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="min-w-full divide-y divide-gray-200">
      <div className="bg-gray-50 p-6">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="bg-white divide-y divide-gray-200">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-6">
            <div className="flex space-x-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Icon for the Three Dot Menu
const ThreeDotIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 hover:text-gray-800">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

// --- Type Definition ---
type Employee = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  status: 'Aktif' | 'Tidak Aktif';
};


// --- Main Database Page Component ---

const DatabasePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // React Query for employees data
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const data = await getEmployees();
      return data.map((item: DatabaseEmployee) => ({
        id: item.id,
        nama: item.nama,
        nip: item.nip,
        jabatan: item.jabatan ?? '',
        status: (item.status === 'aktif' ? 'Aktif' : 'Tidak Aktif') as 'Aktif' | 'Tidak Aktif',
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const employees = useMemo(() => employeesData || [], [employeesData]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // State for the search filter
  const [searchTerm, setSearchTerm] = useState('');
  // State for the status filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Tidak Aktif'>('all');
  // State for dropdown menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Dialog state for tambah pegawai
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    pangkat: '',
    status: 'Aktif',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

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
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(startIdx, startIdx + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // --- CRUD Action Handlers (with console logs for demonstration) ---
  const handleAddEmployee = () => {
    setShowAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setShowAddDialog(false);
    setFormData({ nip: '', nama: '', jabatan: '', pangkat: '', status: 'Aktif' });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setIsSubmitting(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

    const handleAddDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('🔄 Form submission started');
    console.log('📝 Form data:', formData);
    console.log('📷 Selected photo:', selectedPhoto ? `${selectedPhoto.name} (${selectedPhoto.size} bytes)` : 'None');

    try {
      let photoBase64 = undefined;
      
      if (selectedPhoto) {
        console.log('🔄 Converting photo to base64...');
        const reader = new FileReader();
        photoBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            console.log('✅ Photo converted to base64, length:', result.length);
            resolve(result);
          };
          reader.readAsDataURL(selectedPhoto);
        });
      }

      console.log('🚀 Calling addEmployee server action...');
      const success = await addEmployee({
        nama: formData.nama,
        nip: formData.nip,
        jabatan: formData.jabatan,
        pangkat: formData.pangkat,
        foto: photoBase64,
      });

      console.log('📡 Server action result:', success);

      if (success) {
        console.log('✅ Employee added successfully, refreshing data...');
        // Invalidate and refetch employees query
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        
        // Reset form and close dialog
        setFormData({ nip: '', nama: '', jabatan: '', pangkat: '', status: 'Aktif' });
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setShowAddDialog(false);
        
        console.log('🎉 Form reset and dialog closed');
      } else {
        console.error('❌ Server returned failure');
        alert('Gagal menambahkan pegawai. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('❌ Client-side error:', error);
      alert('Terjadi kesalahan saat menambahkan pegawai.');
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Form submission completed');
    }
  };

  const handleDelete = (id: number) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setEmployeeToDelete(employee);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    
    console.log(`🗑️ Attempting to delete employee with ID ${employeeToDelete.id}`);
    
    try {
      const success = await deleteEmployee(employeeToDelete.id);
      
      if (success) {
        console.log(`✅ Employee ${employeeToDelete.id} deleted successfully`);
        
        // Invalidate and refetch employees query
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        
        // Reset to page 1 if needed (will be handled by the updated data)
        setCurrentPage(1);
        
        console.log(`🔄 Employee deleted successfully`);
      } else {
        console.error(`❌ Failed to delete employee ${employeeToDelete.id}`);
        alert('Gagal menghapus pegawai. Silakan coba lagi.');
      }
    } catch (error) {
      console.error(`❌ Error deleting employee ${employeeToDelete.id}:`, error);
      alert('Terjadi kesalahan saat menghapus pegawai.');
    } finally {
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };
  
  // --- NEW: Memoized Pagination Range Logic ---
  const paginationRange = useMemo(() => {
    const totalPageNumbers = 7; // Total numbers to show (e.g., 1 ... 4 5 6 ... 10)

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const siblingCount = 1;
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;
    
    if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        return [firstPageIndex, '...', ...rightRange];
    }
    
    if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return []; // Should not happen
  }, [totalPages, currentPage]);


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
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-left relative max-h-[90vh] overflow-y-auto">
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Foto Pegawai</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isSubmitting}
                      />
                      {photoPreview && (
                        <div className="mt-2">
                          <div className="w-20 h-24 rounded-lg overflow-hidden border border-gray-300" style={{ aspectRatio: '3/4' }}>
                            <Image
                              src={photoPreview}
                              alt="Preview"
                              width={72}
                              height={96}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-black opacity-80"
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && employeeToDelete && (
              <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    Konfirmasi Hapus Pegawai
                  </h3>
                  
                  <div className="mb-6 text-center">
                    <p className="text-gray-600 mb-4">
                      Apakah Anda yakin ingin menghapus pegawai berikut?
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="text-left space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Nama:</span>
                          <span className="text-gray-900">{employeeToDelete.nama}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">NIP:</span>
                          <span className="text-gray-900 font-mono">{employeeToDelete.nip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Jabatan:</span>
                          <span className="text-gray-900">{employeeToDelete.jabatan || '-'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-red-600 text-sm mt-4 font-medium">
                      ⚠️ Tindakan ini tidak dapat dibatalkan!
                    </p>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition font-medium"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition font-medium"
                    >
                      Ya, Hapus
                    </button>
                  </div>
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Aktif' | 'Tidak Aktif')}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black opacity-80"
              >
                <option value="all" className="text-black opacity-80">Semua Status</option>
                <option value="Aktif" className="text-black opacity-80">Aktif</option>
                <option value="Tidak Aktif" className="text-black opacity-80">Tidak Aktif</option>
              </select>
            </div>

            {/* Employee Data Table */}
            {employeesLoading ? (
              <TableSkeleton />
            ) : (
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
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((employee) => (
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
                          <div className="flex justify-center items-center gap-4 relative">
                            {/* Three dot menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === employee.id ? null : employee.id);
                                }}
                                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                                aria-label="Menu"
                              >
                                <ThreeDotIcon />
                              </button>
                              {openMenuId === employee.id && (
                                <div
                                  className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      router.push(`/database/profile/${employee.id}`);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600 font-medium"
                                  >
                                    👤 Lihat Profile
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleDelete(employee.id);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium"
                                  >
                                    🗑️ Delete Profile
                                  </button>
                                </div>
                              )}
                            </div>
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
            )}
            
            {/* --- FIXED & STYLED Pagination Controls --- */}
            {!employeesLoading && totalPages > 0 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        Menampilkan <span className="font-semibold text-gray-800">{paginatedEmployees.length}</span> dari <span className="font-semibold text-gray-800">{filteredEmployees.length}</span> pegawai
                    </div>
                    <nav aria-label="Pagination">
                        <ul className="flex items-center -space-x-px h-10 text-base">
                            <li>
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
                                    </svg>
                                </button>
                            </li>
                            {paginationRange.map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <li key={`dots-${index}`}>
                                            <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">...</span>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={page}>
                                        <button
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`flex items-center justify-center px-4 h-10 leading-tight border ${
                                                currentPage === page
                                                    ? 'z-10 text-white border-blue-600 bg-blue-600'
                                                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                );
                            })}
                             <li>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-s-0 border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                     <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                    </svg>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DatabasePage;
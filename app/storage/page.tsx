'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendancePhotoStats, cleanupOldAttendancePhotos } from '../database/actions';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface StorageStats {
  totalRecordsWithPhotos: number;
  oldRecordsWithPhotos: number;
  totalStorageKB: number;
  oldStorageKB: number;
  potentialSavingsKB: number;
  cutoffDate: string;
}

interface CleanupResult {
  success: boolean;
  recordsCleaned: number;
  estimatedSavingsMB?: number;
  message: string;
}

export default function StoragePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [automationStatus, setAutomationStatus] = useState<'stopped' | 'running' | 'unknown'>('unknown');
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);

  // Fetch storage statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StorageStats>({
    queryKey: ['storage-stats'],
    queryFn: async () => {
      console.log('Fetching storage stats...');
      try {
        const result = await getAttendancePhotoStats();
        console.log('Storage stats result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching storage stats:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch automation status
  useQuery({
    queryKey: ['automation-status'],
    queryFn: async () => {
      const response = await fetch('/api/storage/cleanup?action=status');
      const data = await response.json();
      setAutomationStatus(data.isRunning ? 'running' : 'stopped');
      return data;
    },
    refetchInterval: 10000, // Check status every 10 seconds
  });

  // Manual cleanup mutation
  const cleanupMutation = useMutation<CleanupResult>({
    mutationFn: cleanupOldAttendancePhotos,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      alert(`✅ ${data.message}`);
      setShowCleanupDialog(false);
    },
    onError: (error) => {
      console.error('Cleanup failed:', error);
      alert('❌ Pembersihan gagal. Silakan periksa console untuk detail.');
    },
  });

  // Automation control mutations
  const automationMutation = useMutation({
    mutationFn: async (action: 'start' | 'stop' | 'trigger') => {
      const response = await fetch(`/api/storage/cleanup?action=${action}`, {
        method: action === 'trigger' ? 'POST' : 'GET',
      });
      return response.json();
    },
    onSuccess: (data, action) => {
      if (action === 'start' || action === 'stop') {
        setAutomationStatus(action === 'start' ? 'running' : 'stopped');
        queryClient.invalidateQueries({ queryKey: ['automation-status'] });
      }
      if (action === 'trigger') {
        queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        alert(`✅ Pembersihan manual berhasil dipicu via API`);
      }
      alert(`✅ ${data.message || `Otomatis berhasil ${action === 'start' ? 'dimulai' : 'dihentikan'}`}`);
    },
    onError: (error) => {
      console.error('Automation control failed:', error);
      alert('❌ Kontrol otomatis gagal. Silakan periksa console.');
    },
  });

  // Handle redirect if not superadmin
  useEffect(() => {
    if (session && session.user?.role !== 'superadmin') {
      router.push('/');
    }
  }, [session, router]);

  // Don't render anything while session is loading or if redirecting
  if (!session || session.user?.role !== 'superadmin') {
    return null;
  }

  // Redirect if not superadmin
  if (session?.user?.role !== 'superadmin') {
    router.push('/');
    return null;
  }

  const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  const handleManualCleanup = () => {
    if (stats && stats.oldRecordsWithPhotos > 0) {
      setShowCleanupDialog(true);
    } else {
      alert('ℹ️ Tidak ada foto lama yang perlu dibersihkan.');
    }
  };

  const confirmCleanup = () => {
    cleanupMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Manajemen Penyimpanan</h1>

            {/* Storage Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Statistik Penyimpanan</h2>
              
              {statsLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="text-xs text-gray-500 mt-2">Memuat data statistik...</div>
                </div>
              ) : statsError ? (
                <div className="text-red-600">
                  <p className="font-semibold">Error memuat statistik:</p>
                  <p className="text-sm mt-1">{statsError instanceof Error ? statsError.message : 'Unknown error'}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Penyimpanan Saat Ini</h3>
                    <div className="space-y-2 text-sm">
                      <p className='text-black'>📸 Total rekord dengan foto: <span className="font-semibold">{stats.totalRecordsWithPhotos.toLocaleString()}</span></p>
                      <p className='text-black'>💾 Total penyimpanan terpakai: <span className="font-semibold text-blue-600">{formatFileSize(stats.totalStorageKB)}</span></p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Potensi Pembersihan</h3>
                    <div className="space-y-2 text-sm">
                      <p className='text-black'>🗓️ Foto lama (3+ bulan): <span className="font-semibold text-orange-600">{stats.oldRecordsWithPhotos.toLocaleString()}</span></p>
                      <p className='text-black'>💾 Potensi penghematan: <span className="font-semibold text-green-600">{formatFileSize(stats.potentialSavingsKB)}</span></p>
                      <p className='text-black'>📅 Tanggal batas: <span className="font-medium">{stats.cutoffDate}</span></p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>Tidak ada data statistik tersedia</p>
                  <button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['storage-stats'] })} 
                    className="mt-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Muat Ulang
                  </button>
                </div>
              )}
            </div>

            {/* Automation Control */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🤖 Pembersihan Otomatis</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status Otomatis:</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      automationStatus === 'running' ? 'bg-green-500' : 
                      automationStatus === 'stopped' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={`font-medium ${
                      automationStatus === 'running' ? 'text-green-700' : 
                      automationStatus === 'stopped' ? 'text-red-700' : 'text-gray-600'
                    }`}>
                      {automationStatus === 'running' ? 'Berjalan' : 
                       automationStatus === 'stopped' ? 'Berhenti' : 'Memeriksa...'}
                    </span>
                  </div>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => automationMutation.mutate('start')}
                    disabled={automationMutation.isPending || automationStatus === 'running'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Mulai Otomatis
                  </button>
                  <button
                    onClick={() => automationMutation.mutate('stop')}
                    disabled={automationMutation.isPending || automationStatus === 'stopped'}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Hentikan Otomatis
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p><strong>Cara kerja:</strong> Ketika diaktifkan, sistem secara otomatis memeriksa foto yang lebih dari 3 bulan setiap 24 jam dan menghapusnya untuk menghemat ruang penyimpanan. Hanya data foto yang dihapus - rekord absensi tetap terjaga.</p>
              </div>
            </div>

            {/* Manual Cleanup */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🧹 Pembersihan Manual</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Bersihkan foto yang lebih dari 3 bulan secara langsung.
                  </p>
                  {stats && (
                    <p className="text-sm text-gray-500">
                      Akan membersihkan {stats.oldRecordsWithPhotos.toLocaleString()} foto, 
                      menghemat sekitar {formatFileSize(stats.potentialSavingsKB)}
                    </p>
                  )}
                </div>
                <div className="space-x-3">
                  <button
                    onClick={handleManualCleanup}
                    disabled={cleanupMutation.isPending || !stats || stats.oldRecordsWithPhotos === 0}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cleanupMutation.isPending ? 'Membersihkan...' : 'Bersihkan Foto Lama'}
                  </button>
                  <button
                    onClick={() => automationMutation.mutate('trigger')}
                    disabled={automationMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Jalankan via API
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Cleanup Confirmation Dialog */}
      {showCleanupDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Pembersihan</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus foto dari {stats?.oldRecordsWithPhotos.toLocaleString()} rekord absensi yang lebih dari 3 bulan?
              <br /><br />
              <strong>Tindakan ini tidak dapat dibatalkan.</strong>
              <br />
              Perkiraan penghematan ruang: {stats ? formatFileSize(stats.potentialSavingsKB) : 'N/A'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCleanupDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmCleanup}
                disabled={cleanupMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cleanupMutation.isPending ? 'Membersihkan...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

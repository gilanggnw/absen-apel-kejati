'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cleanupOldAttendancePhotos } from '../database/actions';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// ================================
// TYPE DEFINITIONS
// ================================
interface StorageStats {
  totalRecordsWithPhotos: number;
  oldRecordsWithPhotos: number;
  totalStorageKB: number;
  oldStorageKB: number;
  potentialSavingsKB: number;
  cutoffDate: string;
  testMode?: boolean;
  timeLabel?: string;
}

interface CleanupResult {
  success: boolean;
  recordsCleaned: number;
  estimatedSavingsMB?: number;
  message: string;
}

// ================================
// STORAGE MANAGEMENT COMPONENT
// ================================
export default function StoragePage() {
  // Authentication and navigation
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Component state
  const [automationStatus, setAutomationStatus] = useState<'stopped' | 'running' | 'unknown'>('unknown');
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // ================================
  // DATA FETCHING HOOKS
  // ================================
  // Fetch storage statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StorageStats>({
    queryKey: ['storage-stats', testMode],
    queryFn: async () => {
      console.log('Fetching storage stats...', testMode ? '(TEST MODE - 1 day)' : '(PRODUCTION MODE - 3 months)');
      try {
        const response = await fetch(`/api/storage/stats?testMode=${testMode}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
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

  // ================================
  // MUTATION HOOKS
  // ================================
  // Manual cleanup mutation
  const cleanupMutation = useMutation<CleanupResult>({
    mutationFn: () => cleanupOldAttendancePhotos(testMode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storage-stats', testMode] });
      alert(`✅ ${data.message}`);
      setShowCleanupDialog(false);
    },
    onError: (error) => {
      console.error('Cleanup failed:', error);
      alert('❌ Pembersihan gagal. Silakan periksa console untuk detail.');
    },
  });

  // Test cleanup mutation - always deletes photos older than 1 week
  const testCleanupMutation = useMutation<CleanupResult>({
    mutationFn: () => cleanupOldAttendancePhotos(true), // Force test mode (1 week)
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storage-stats', testMode] });
      alert(`✅ Test Cleanup: ${data.message}`);
    },
    onError: (error) => {
      console.error('Test cleanup failed:', error);
      alert('❌ Test cleanup gagal. Silakan periksa console untuk detail.');
    },
  });

  // Automation control mutations
  const automationMutation = useMutation({
    mutationFn: async (action: 'start' | 'stop' | 'trigger' | 'start-immediate' | 'start-test') => {
      let url = `/api/storage/cleanup?action=${action.startsWith('start') ? 'start' : action}`;
      if (action === 'start-immediate') {
        url += '&immediate=true';
      } else if (action === 'start-test') {
        url += '&immediate=true&testInterval=true';
      }
      
      const response = await fetch(url, {
        method: action === 'trigger' ? 'POST' : 'GET',
      });
      return response.json();
    },
    onSuccess: (data, action) => {
      if (action === 'start' || action === 'stop' || action === 'start-immediate' || action === 'start-test') {
        setAutomationStatus((action.startsWith('start')) ? 'running' : 'stopped');
        queryClient.invalidateQueries({ queryKey: ['automation-status'] });
      }
      if (action === 'trigger' || action === 'start-immediate' || action === 'start-test') {
        queryClient.invalidateQueries({ queryKey: ['storage-stats', testMode] });
        if (action === 'trigger') {
          alert(`✅ Pembersihan manual berhasil dipicu via API`);
        }
      }
      alert(`✅ ${data.message || `Otomatis berhasil ${(action.startsWith('start')) ? 'dimulai' : 'dihentikan'}`}`);
    },
    onError: (error) => {
      console.error('Automation control failed:', error);
      alert('❌ Kontrol otomatis gagal. Silakan periksa console.');
    },
  });

  // ================================
  // AUTOMATION & EFFECTS
  // ================================
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

  // ================================
  // UTILITY FUNCTIONS
  // ================================
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

  // ================================
  // COMPONENT RENDER
  // ================================
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Penyimpanan</h1>
              
              {/* Test Mode Toggle */}
              <div className="flex items-center space-x-3 bg-white rounded-lg shadow-md px-4 py-2">
                <span className="text-sm font-medium text-gray-700">Mode:</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    testMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      testMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${testMode ? 'text-blue-600' : 'text-gray-500'}`}>
                    {testMode ? 'Test (1 Hari)' : 'Production (3 Bulan)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Test Mode Info Banner */}
            {testMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600">🧪</span>
                  <h3 className="font-semibold text-blue-800">Mode Test Aktif</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Dalam mode test, sistem akan menghapus foto yang lebih dari <strong>1 hari</strong> (bukan 3 bulan).
                  Gunakan tombol &quot;🧪 Test Delete (1 Day)&quot; untuk menguji penghapusan foto langsung.
                </p>
                {stats && (
                  <div className="text-sm text-blue-600">
                    <strong>Data Test:</strong> {stats.oldRecordsWithPhotos.toLocaleString()} foto ditemukan lebih dari 1 hari 
                    (sekitar {((stats.potentialSavingsKB || 0) / 1024).toFixed(1)} MB)
                  </div>
                )}
              </div>
            )}

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
                    className="mt-2 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 rounded-lg"
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
                      <p className='text-black'>🗓️ Foto lama ({stats.timeLabel || '3 bulan'}): <span className="font-semibold text-orange-600">{stats.oldRecordsWithPhotos.toLocaleString()}</span></p>
                      <p className='text-black'>💾 Potensi penghematan: <span className="font-semibold text-green-600">{formatFileSize(stats.potentialSavingsKB)}</span></p>
                      <p className='text-black'>📅 Tanggal batas: <span className="font-medium">{stats.cutoffDate}</span></p>
                      {stats.testMode && (
                        <p className="text-blue-600 text-xs font-medium">⚠️ Mode Test Aktif</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>Tidak ada data statistik tersedia</p>
                  <button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['storage-stats'] })} 
                    className="mt-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
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
                <div className="space-x-2">
                  <button
                    onClick={() => automationMutation.mutate('start')}
                    disabled={automationMutation.isPending || automationStatus === 'running'}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mulai Otomatis
                  </button>
                  <button
                    onClick={() => automationMutation.mutate('start-immediate')}
                    disabled={automationMutation.isPending || automationStatus === 'running'}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Start automation with immediate first cleanup"
                  >
                    🧪 Test Start
                  </button>
                  <button
                    onClick={() => automationMutation.mutate('start-test')}
                    disabled={automationMutation.isPending || automationStatus === 'running'}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Start automation with 5-minute intervals for testing"
                  >
                    ⚡ 5min Test
                  </button>
                  <button
                    onClick={() => automationMutation.mutate('stop')}
                    disabled={automationMutation.isPending || automationStatus === 'stopped'}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hentikan Otomatis
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p><strong>Cara kerja:</strong> Ketika diaktifkan, sistem secara otomatis memeriksa foto yang lebih dari {testMode ? '1 hari' : '3 bulan'} setiap 24 jam dan menghapusnya untuk menghemat ruang penyimpanan. Hanya data foto yang dihapus - rekord absensi tetap terjaga.</p>
                {testMode && (
                  <p className="text-blue-600 font-medium mt-2">⚠️ Mode Test: Foto yang lebih dari 1 hari akan dihapus (untuk testing)</p>
                )}
              </div>
            </div>

            {/* Manual Cleanup */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🧹 Pembersihan Manual</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Bersihkan foto yang lebih dari {testMode ? '1 hari' : '3 bulan'} secara langsung.
                  </p>
                  {stats && (
                    <p className="text-sm text-gray-500">
                      Akan membersihkan {stats.oldRecordsWithPhotos.toLocaleString()} foto, 
                      menghemat sekitar {formatFileSize(stats.potentialSavingsKB)}
                    </p>
                  )}
                  {testMode && (
                    <p className="text-blue-600 text-xs font-medium mt-1">⚠️ Mode Test: Hanya foto 1+ hari</p>
                  )}
                </div>
                <div className="space-x-3">
                  <button
                    onClick={handleManualCleanup}
                    disabled={cleanupMutation.isPending || !stats || stats.oldRecordsWithPhotos === 0}
                    className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cleanupMutation.isPending ? 'Membersihkan...' : 'Bersihkan Foto Lama'}
                  </button>
                  <button
                    onClick={() => testCleanupMutation.mutate()}
                    disabled={testCleanupMutation.isPending}
                    className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Hapus foto yang lebih dari 1 hari (untuk testing)"
                  >
                    {testCleanupMutation.isPending ? 'Testing...' : '🧪 Test Delete (1 Day)'}
                  </button>
                  <button
                    onClick={() => automationMutation.mutate('trigger')}
                    disabled={automationMutation.isPending}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              Apakah Anda yakin ingin menghapus foto dari {stats?.oldRecordsWithPhotos.toLocaleString()} rekord absensi yang lebih dari {testMode ? '1 hari' : '3 bulan'}?
              <br /><br />
              <strong>Tindakan ini tidak dapat dibatalkan.</strong>
              <br />
              Perkiraan penghematan ruang: {stats ? formatFileSize(stats.potentialSavingsKB) : 'N/A'}
              {testMode && (
                <>
                  <br />
                  <span className="text-blue-600 font-medium">⚠️ Mode Test Aktif (1 hari)</span>
                </>
              )}
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowCleanupDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmCleanup}
                disabled={cleanupMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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

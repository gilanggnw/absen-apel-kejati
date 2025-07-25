'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getEmployees, saveAttendance, type DatabaseEmployee } from '../../database/actions';

// Component that uses useSearchParams
function FotoPageContent() {
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  // State to manage the captured image data URL
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // State to manage the camera stream
  const [stream, setStream] = useState<MediaStream | null>(null);
  // State for employee data
  const [employee, setEmployee] = useState<DatabaseEmployee | null>(null);
  // State for loading employee data
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);
  // State for saving attendance
  const [isSaving, setIsSaving] = useState(false);
  // Ref for the video element
  const videoRef = useRef<HTMLVideoElement>(null);
  // Ref for the canvas element used for capturing the photo
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get employee data from URL parameters
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const nip = searchParams.get('nip');
      const nama = searchParams.get('nama');
      
      if (nip) {
        try {
          // Fetch all employees and find the one with matching NIP
          const employees = await getEmployees();
          const foundEmployee = employees.find(emp => emp.nip === nip);
          
          if (foundEmployee) {
            setEmployee(foundEmployee);
          } else if (nama) {
            // Fallback: create employee object from URL params if not found in DB
            setEmployee({
              id: 0,
              nip: nip,
              nama: decodeURIComponent(nama),
              jabatan: null,
              pangkat: null,
              foto: null,
              status: ''
            });
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
          // Fallback to URL params if database fetch fails
          if (nip && nama) {
            setEmployee({
              id: 0,
              nip: nip,
              nama: decodeURIComponent(nama),
              jabatan: null,
              pangkat: null,
              foto: null,
              status: ''
            });
          }
        }
      }
      setIsLoadingEmployee(false);
    };

    fetchEmployeeData();
  }, [searchParams]);

  // Function to start the camera
  const startCamera = React.useCallback(async () => {
    if (stream) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }, [stream]);

  // Function to stop the camera
  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Function to capture a photo from the video stream
  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match the video feed
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the image data URL from the canvas
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);

      // Stop the camera after taking the photo
      stopCamera();
    }
  };

  // Function to retake the photo
  const handleRetakePhoto = () => {
    setCapturedImage(null);
    startCamera(); // Restart the camera
  };

  // Function to save the photo
  const handleSavePhoto = async () => {
    if (!capturedImage || !employee) {
      console.error('No photo captured or employee data missing');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 Saving attendance record for:', employee.nama);
      
      // Determine attendance status based on current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute; // Convert to minutes since midnight
      
      // Define attendance rules (can be configured)
      const onTimeLimit = 8 * 60; // 8:00 AM in minutes
      const lateLimit = 9 * 60; // 9:00 AM in minutes
      
      let status = 'Hadir'; // Default: present
      if (currentTime > onTimeLimit && currentTime <= lateLimit) {
        status = 'Hadir (telat)';
      } else if (currentTime > lateLimit) {
        status = 'Hadir (telat)';
      }

      const attendanceData = {
        nip: employee.nip,
        photo: capturedImage,
        status: status,
        verified_by: undefined // Will be set when verification feature is added
      };

      console.log('📤 Submitting attendance with status:', status);
      
      const success = await saveAttendance(attendanceData);
      
      if (success) {
        console.log('✅ Attendance saved successfully');
        setShowDialog(true);
      } else {
        console.error('❌ Failed to save attendance');
        alert('Gagal menyimpan data absensi. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('❌ Error saving attendance:', error);
      alert('Terjadi kesalahan saat menyimpan data absensi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Effect to start the camera when the component mounts
  useEffect(() => {
    startCamera();

    // Cleanup function to stop the camera when the component unmounts
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]); // Empty dependency array ensures this runs only once on mount


  return (
    <div className="flex h-screen bg-white font-sans">
      {/* Sidebar Section */}
      <aside className="w-1/4 bg-gray-100 p-8 flex flex-col items-center text-center border-r border-gray-200">
        {/* Profile Picture */}
        <div className="w-40 h-40 bg-gray-500 rounded-full mb-6 shadow-md overflow-hidden flex items-center justify-center">
          {isLoadingEmployee ? (
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
          ) : employee?.foto ? (
            <Image
              src={employee.foto}
              alt={employee.nama}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-300 text-6xl">👤</div>
          )}
        </div>
        
        {/* User Information */}
        {isLoadingEmployee ? (
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div>
          </div>
        ) : employee ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800">{employee.nama}</h2>
            <p className="text-lg text-gray-600 mt-1">
              {employee.jabatan || 'Tidak ada jabatan'}
            </p>
            <p className="text-lg text-gray-500 font-mono mt-2">NIP: {employee.nip}</p>
            {employee.pangkat && (
              <p className="text-sm text-gray-500 mt-1">{employee.pangkat}</p>
            )}
          </>
        ) : (
          <div className="text-gray-500">
            <h2 className="text-xl font-bold">Data pegawai tidak ditemukan</h2>
            <p className="text-sm mt-2">Silakan kembali dan pilih pegawai</p>
          </div>
        )}
      </aside>

      {/* Main Content Section */}
      <main className="w-3/4 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <button
            onClick={() => window.location.href = '/absen'}
            className="mb-6 px-6 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            &larr; Kembali ke Absen
          </button>
          {/* Display Area for Camera or Captured Photo */}
          {/* Display Area for Camera or Captured Photo */}
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full aspect-video mb-6 flex items-center justify-center overflow-hidden">
            {capturedImage ? (
              <Image
                src={capturedImage}
                alt="Captured"
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            )}
          </div>
          {/* Hidden canvas for capturing photo */}
          <canvas ref={canvasRef} className="hidden"></canvas>

          {/* Action Buttons */}
          {capturedImage ? (
            <div className="flex flex-col gap-4">
              <button
                onClick={handleRetakePhoto}
                className="w-full bg-blue-500 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
              >
                Ambil Ulang Foto (Retake)
              </button>
              <button
                onClick={handleSavePhoto}
                disabled={isSaving}
                className="w-full bg-[#22B573] text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-[#1a9e5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22B573] transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  'Simpan Foto (Save Photo)'
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleTakePhoto}
              disabled={!stream}
              className="w-full bg-gray-200 text-gray-800 text-lg font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ambil Foto (Take Photo)
            </button>
          )}
        </div>
      {/* Dialog for photo saved */}
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.75)] z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-black">Absensi Berhasil!</h2>
            <p className="text-gray-600 mb-4">
              Data absensi untuk <strong>{employee?.nama}</strong> telah berhasil disimpan.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Waktu: {new Date().toLocaleString('id-ID')}
            </p>            
            <button
              onClick={() => {
                setShowDialog(false)
                window.location.href = '/absen';
              }}
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Kembali ke Halaman Absen
            </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

// Loading component for Suspense fallback
function FotoPageLoading() {
  return (
    <div className="flex h-screen bg-white font-sans">
      <aside className="w-1/4 bg-gray-100 p-8 flex flex-col items-center text-center border-r border-gray-200">
        <div className="w-40 h-40 bg-gray-300 rounded-full mb-6 shadow-md animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div>
        </div>
      </aside>
      <main className="w-3/4 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6 h-10 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="bg-gray-300 rounded-lg w-full aspect-video mb-6 animate-pulse"></div>
          <div className="h-12 bg-gray-300 rounded w-full animate-pulse"></div>
        </div>
      </main>
    </div>
  );
}

// Main export component with Suspense boundary
export default function FotoPage() {
  return (
    <Suspense fallback={<FotoPageLoading />}>
      <FotoPageContent />
    </Suspense>
  );
}
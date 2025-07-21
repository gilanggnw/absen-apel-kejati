'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// Main App Component for the Photo Attendance Page
export default function FotoPage() {
  const [showDialog, setShowDialog] = useState(false);
  // State to manage the captured image data URL
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // State to manage the camera stream
  const [stream, setStream] = useState<MediaStream | null>(null);
  // Ref for the video element
  const videoRef = useRef<HTMLVideoElement>(null);
  // Ref for the canvas element used for capturing the photo
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to start the camera
  const startCamera = async () => {
    // Don't start if there's already a stream
    if (stream) return; 
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Handle errors, e.g., show a message to the user
    }
  };

  // Function to stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

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
  const handleSavePhoto = () => {
    // Here you would add logic to actually save the photo (e.g., upload to server)
    setShowDialog(true);
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
        {/* Profile Picture Placeholder */}
        <div className="w-40 h-40 bg-gray-500 rounded-full mb-6 shadow-md"></div>
        
        {/* User Information */}
        <h2 className="text-2xl font-bold text-gray-800">mamang kesbor</h2>
        <p className="text-lg text-gray-600 mt-1">staf keren</p>
        <p className="text-lg text-gray-500 font-mono mt-2">273477634</p>
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
                className="w-full bg-[#22B573] text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-[#1a9e5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22B573] transition-transform transform hover:scale-105"
              >
                Simpan Foto (Save Photo)
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
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-black">Data berhasil disimpan</h2>            
              <button
                onClick={() => {
                  setShowDialog(false)
                  window.location.href = '/absen';
                }}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                OK
              </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
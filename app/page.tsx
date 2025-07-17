'use client';


import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import Sidebar from './components/Sidebar';


export default function Page() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // You can add authentication logic here if needed
    router.push('/absen');
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Logo Placeholder */}
        <div className="flex items-center justify-center bg-[#FFD600]">
          <div className="flex flex-col items-center justify-center">
            {/* Big SVG placeholder icon */}
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
              className="mb-6"
            >
              <circle cx="90" cy="90" r="90" fill="#FFF" />
              <text
                x="90"
                y="110"
                textAnchor="middle"
                fill="#FFD600"
                fontSize="60"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
              >
                Logo
              </text>
            </svg>
            <span className="text-2xl font-semibold text-black opacity-60">Placeholder</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-xs flex flex-col justify-center">
            <h1 className="mb-8 text-3xl font-black tracking-wide text-[#FFD600] text-center">
              ABSEN APEL
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="rounded-lg bg-[#FFD600]/20 px-4 py-3 text-base text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                aria-label="Username"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="rounded-lg bg-[#FFD600]/20 px-4 py-3 text-base text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                aria-label="Password"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#22B573] py-3 font-semibold text-white transition hover:bg-[#1a9e5f]"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';

export default function Page() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // You can add authentication logic here if needed
    router.push('/absen');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-8">
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-10 md:flex-row md:gap-20">
        {/* Left Side: Logo Placeholder */}
        <div className="flex h-80 w-80 flex-shrink-0 flex-col items-center justify-center bg-[#FFD600] text-center rounded-xl shadow-lg">
          <span className="text-3xl font-bold text-black">Logo</span>
          <span className="text-3xl font-bold text-black">Placeholder</span>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex w-full max-w-xs flex-col justify-center">
          <h1 className="mb-8 text-3xl font-black tracking-wide text-[#000000]">
            ABSEN APEL
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="rounded-lg bg-[#000000]/20 px-4 py-3 text-base text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
              aria-label="Username"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="rounded-lg bg-[#000000]/20 px-4 py-3 text-base text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
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
  );
}
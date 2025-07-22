'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect based on role after login
  useEffect(() => {
    if (session?.user?.role) {
      switch (session.user.role) {
        case 'superadmin':
          router.push('/database');
          break;
        case 'adminverif':
          router.push('/rekap');
          break;
        case 'user':
          router.push('/absen');
          break;
        default:
          router.push('/absen');
      }
    }
  }, [session, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      }
      // Redirect will be handled by useEffect based on role
    } catch {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FFD600] grid grid-cols-1 md:grid-cols-2">
      {/* Left Side: Logo Placeholder */}
      <div className="flex items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center">
          {/* Big SVG placeholder icon */}
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            fill="none"
            className="mb-6"
          >
            <circle cx="90" cy="90" r="90" fill="#FFD600" />
            <text
              x="90"
              y="110"
              textAnchor="middle"
              fill="#FFF"
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
          <h1 className="mb-8 text-3xl font-black tracking-wide text-black text-center drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)]">
            ABSEN APEL
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-100 p-2 rounded">
                {error}
              </div>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="rounded-lg bg-white/80 px-4 py-3 text-base text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Email"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="rounded-lg bg-white/80 px-4 py-3 text-base text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#22B573] py-3 font-semibold text-white transition hover:bg-[#1a9e5f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
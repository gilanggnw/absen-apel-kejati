'use client';

import React from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

// SVG Icon for the User Profile - Updated to be a filled icon
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-[#222]"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

// SVG Icon for Logout
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-[#222]"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
      clipRule="evenodd"
    />
  </svg>
);

// Interface for Header props
interface HeaderProps {
  logoContent?: React.ReactNode;
}

// The Header component
const Header = ({ logoContent }: HeaderProps) => {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getUserDisplayName = () => {
    if (!session?.user) return "Guest";
    
    const name = session.user.name || session.user.email;
    const role = session.user.role;
    
    if (role) {
      return `${name} (${role.charAt(0).toUpperCase() + role.slice(1)})`;
    }
    
    return name;
  };
  return (
    <header className="w-full bg-[#FFD600]">
      <div className="max-w-full mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Title on the left */}
          <div className="flex-shrink-0">
            {logoContent ? logoContent : (
              <div className="flex items-center space-x-3">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <h1 className="text-2xl font-bold text-black">Absen Apel</h1>
              </div>
            )}
          </div>

          {/* Welcome message and User controls on the right */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <span className="text-[#222] font-medium">Loading...</span>
            ) : session?.user ? (
              <>
                <span className="text-[#222] font-medium">Welcome {getUserDisplayName()}</span>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/60">
                  <UserIcon />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                  title="Logout"
                >
                  <LogoutIcon />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            ) : (
              <span className="text-[#222] font-medium">Not logged in</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
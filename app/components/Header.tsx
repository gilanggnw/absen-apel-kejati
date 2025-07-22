'use client';

import React from 'react';

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

// Interface for Header props
interface HeaderProps {
  username?: string;
  logoContent?: React.ReactNode;
}

// The Header component
const Header = ({ username = "adminverif (Administrator)", logoContent }: HeaderProps) => {
  return (
    <header className="w-full bg-[#FFD600]">
      <div className="max-w-full mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Title on the left */}
          <div className="flex-shrink-0">
            {logoContent ? logoContent : <h1 className="text-2xl font-bold text-black">Absen Apel</h1>}
          </div>

          {/* Welcome message and User Icon on the right */}
          <div className="flex items-center space-x-4">
            <span className="text-[#222] font-medium">Welcome {username}</span>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/60">
              <UserIcon />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
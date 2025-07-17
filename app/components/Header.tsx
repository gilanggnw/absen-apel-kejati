'use client';

import React from 'react';

// SVG Icon for the User Profile
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-gray-600"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface HeaderProps {
  username?: string;
  logoContent?: React.ReactNode;
}

export default function Header({ username = "userptsp", logoContent }: HeaderProps) {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            {logoContent && logoContent}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome {username}</span>
            <div className="p-2 rounded-full bg-gray-200">
              <UserIcon />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

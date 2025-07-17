
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-48 bg-[#FFD600] flex flex-col py-8 px-4 shadow-lg">
      <nav className="flex flex-col h-full justify-between">
        <div className="flex flex-col gap-4 items-start">
          <Link href="/rekap">
            <span
              className={`block py-2 px-4 rounded-lg font-semibold transition cursor-pointer ${
                pathname === '/rekap'
                  ? 'bg-[#22B573] text-white'
                  : 'text-black hover:bg-[#22B573] hover:text-white'
              }`}
            >
              Rekap
            </span>
          </Link>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <Link href="/verifikasi">
            <span
              className={`block py-2 px-4 rounded-lg font-semibold transition cursor-pointer ${
                pathname === '/verifikasi'
                  ? 'bg-[#22B573] text-white'
                  : 'text-black hover:bg-[#22B573] hover:text-white'
              }`}
            >
              Verifikasi
            </span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

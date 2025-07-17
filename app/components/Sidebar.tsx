import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="h-full w-48 bg-[#FFD600] flex flex-col py-8 px-4 shadow-lg">
      <nav className="flex flex-col gap-4">
        <Link href="/rekap">
          <span className="block py-2 px-4 rounded-lg text-black font-semibold hover:bg-[#22B573] hover:text-white transition cursor-pointer">Rekap</span>
        </Link>
        <Link href="/verifikasi">
          <span className="block py-2 px-4 rounded-lg text-black font-semibold hover:bg-[#22B573] hover:text-white transition cursor-pointer">Verifikasi</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;

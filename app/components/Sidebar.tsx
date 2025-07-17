'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const linkClasses = `block w-full text-left py-3 px-4 text-lg font-semibold rounded-lg transition-colors duration-200`;
    const activeLinkClasses = 'bg-white shadow-md text-black';
    const inactiveLinkClasses = 'text-gray-700 hover:bg-gray-200';

    return (
        <aside className="h-screen w-64 bg-gray-100 flex flex-col p-4 border-r border-gray-200">
            <nav>
                <ul className="flex flex-col">
                    <li>
                        <Link href="/rekap" passHref>
                            <span
                                className={`${linkClasses} ${pathname === '/rekap' ? activeLinkClasses : inactiveLinkClasses}`}
                            >
                                Rekap
                            </span>
                        </Link>
                    </li>
                    <li className="mt-2">
                        <Link href="/verifikasi" passHref>
                            <span
                                className={`${linkClasses} ${pathname === '/verifikasi' ? activeLinkClasses : inactiveLinkClasses}`}
                            >
                                Verifikasi
                            </span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
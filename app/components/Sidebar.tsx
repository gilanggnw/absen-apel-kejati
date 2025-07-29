'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    
    const userRole = session?.user?.role;

    const linkClasses = `block w-full text-left py-3 px-4 text-lg font-semibold rounded-lg transition-colors duration-200`;
    // Use #FFD600 for the highlight background and #222 for text for contrast
    const activeLinkClasses = 'bg-[#FFD600] text-[#222] shadow-md';
    const inactiveLinkClasses = 'text-gray-700 hover:bg-gray-200';

    return (
        <aside className="h-screen w-64 bg-gray-100 flex flex-col p-4 border-r border-gray-200">
            <nav>
                <ul className="flex flex-col">
                    {/* Show Absen for user role */}
                    {userRole === 'user' && (
                        <li>
                            <Link href="/absen" passHref>
                                <span
                                    className={`${linkClasses} ${pathname === '/absen' ? activeLinkClasses : inactiveLinkClasses}`}
                                >
                                    Absen
                                </span>
                            </Link>
                        </li>
                    )}
                    
                    {/* Show Rekap for adminverif and superadmin */}
                    {(userRole === 'adminverif' || userRole === 'superadmin') && (
                        <li className="mt-2">
                            <Link href="/rekap" passHref>
                                <span
                                    className={`${linkClasses} ${pathname === '/rekap' ? activeLinkClasses : inactiveLinkClasses}`}
                                >
                                    Rekap
                                </span>
                            </Link>
                        </li>
                    )}
                    
                    {/* Show Verifikasi for adminverif and superadmin */}
                    {(userRole === 'adminverif' || userRole === 'superadmin') && (
                        <li className="mt-2">
                            <Link href="/verifikasi" passHref>
                                <span
                                    className={`${linkClasses} ${pathname === '/verifikasi' ? activeLinkClasses : inactiveLinkClasses}`}
                                >
                                    Verifikasi
                                </span>
                            </Link>
                        </li>
                    )}
                    
                    {/* Show Database only for superadmin */}
                    {userRole === 'superadmin' && (
                        <li className="mt-2">
                            <Link href="/database" passHref>
                                <span
                                    className={`${linkClasses} ${pathname === '/database' ? activeLinkClasses : inactiveLinkClasses}`}
                                >
                                    Database
                                </span>
                            </Link>
                        </li>
                    )}
                    
                    {/* Show Storage only for superadmin */}
                    {userRole === 'superadmin' && (
                        <li className="mt-2">
                            <Link href="/storage" passHref>
                                <span
                                    className={`${linkClasses} ${pathname === '/storage' ? activeLinkClasses : inactiveLinkClasses}`}
                                >
                                    Penyimpanan
                                </span>
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
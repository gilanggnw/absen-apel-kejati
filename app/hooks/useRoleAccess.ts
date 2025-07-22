'use client';

import { useSession } from 'next-auth/react';

export const useRoleAccess = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const hasAccess = (allowedRoles: string[]) => {
    return userRole ? allowedRoles.includes(userRole) : false;
  };

  const canAccessDatabase = () => hasAccess(['superadmin']);
  const canAccessRekap = () => hasAccess(['adminverif', 'superadmin']);
  const canAccessVerifikasi = () => hasAccess(['adminverif', 'superadmin']);
  const canAccessAbsen = () => hasAccess(['user', 'adminverif', 'superadmin']);

  return {
    userRole,
    hasAccess,
    canAccessDatabase,
    canAccessRekap,
    canAccessVerifikasi,
    canAccessAbsen,
  };
};

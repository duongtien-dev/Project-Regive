'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

const DASHBOARD_PREFIXES = ['/me', '/profile', '/notifications'];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDashboard =
    mounted &&
    DASHBOARD_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </>
  );
};

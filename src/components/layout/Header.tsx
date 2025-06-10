
'use client';

import Link from 'next/link';
import { MainNav } from './MainNav';
import { UserNav } from './UserNav';
import { Building } from 'lucide-react';
import { ThemeToggleButton } from './ThemeToggleButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-700/30 bg-gradient-to-r from-gradient-start/70 to-gradient-end/70 backdrop-blur-lg supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-gradient-start/40 supports-[backdrop-filter]:to-gradient-end/40">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-heading-foreground" style={{ fontFamily: 'var(--font-montserrat)'}}>Hommie.cl AI</span>
        </Link>
        <MainNav className="mx-6" />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggleButton />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

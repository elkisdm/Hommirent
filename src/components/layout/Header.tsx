
'use client';

import Link from 'next/link';
import { MainNav } from './MainNav';
import { UserNav } from './UserNav';
import { Building } from 'lucide-react';
import { ThemeToggleButton } from './ThemeToggleButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-montserrat)'}}>Hommie.cl AI</span>
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

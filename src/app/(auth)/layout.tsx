import Link from 'next/link';
import { Building } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <Building className="h-8 w-8 text-primary" />
          <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-montserrat)'}}>Hommie.cl AI</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

'use client'
// This page can serve as the main landing page or redirect to property listings.
// For now, let's make it a simple welcome and redirect to properties page.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/properties');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <Spinner size="large" />
      <p className="text-xl mt-4 text-muted-foreground">Cargando propiedades...</p>
    </div>
  );
}

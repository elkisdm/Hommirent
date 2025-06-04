
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldCheck, Settings } from 'lucide-react'; 
import { MainNav } from './components/AdminMainNav'; // We'll create this simple nav

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userProfile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      } else if (userProfile.role !== 'superadmin') {
        toast({ title: 'Acceso Denegado', description: 'No tienes permisos para acceder a esta sección.', variant: 'destructive' });
        router.replace('/'); 
      }
    }
  }, [userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== 'superadmin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="large" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  // Inline toast definition for admin layout, assuming useToast might not be ideal here or for simplicity.
  // For a real app, you'd use the global toast hook.
  const toast = (options: {title: string, description?: string, variant?: "default" | "destructive"}) => {
      if (typeof window !== 'undefined') {
        // This is a placeholder. In a real scenario, you'd use the actual useToast hook.
        alert(`${options.title}${options.description ? ': ' + options.description : ''}`);
      }
      console.log("Toast:", options);
  };


  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold">Hommie.cl Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto py-6 pr-6 md:py-8 border-r">
          <AdminNav />
        </aside>
        <main className="relative py-6 lg:py-8 md:col-start-2">
          {children}
        </main>
      </div>
    </div>
  );
}

// Simple Nav for Admin Panel
function AdminNav() {
    // In a real app, usePathname from next/navigation to highlight active links
  return (
    <nav className="grid items-start gap-2">
      <Link href="/admin/dashboard" className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        <Settings className="mr-2 h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      {/* Add more admin links here: e.g., User Management, Property Management etc. */}
      {/* Example:
      <Link href="/admin/users" className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        <Users className="mr-2 h-4 w-4" />
        <span>Users</span>
      </Link>
      */}
    </nav>
  );
}

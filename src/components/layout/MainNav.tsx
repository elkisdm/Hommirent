'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  const routes = [
    { href: '/properties', label: 'Propiedades', public: true },
    // { href: '/chat', label: 'Asistente IA', public: true }, // Removed this link
    { 
      href: userProfile?.role === 'propietario' ? '/dashboard/landlord' : (userProfile?.role === 'arrendatario' ? '/profile' : '/profile'), 
      label: 'Mi Panel', 
      auth: true 
    },
  ];

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((route) => {
        if (route.auth && !userProfile) return null;
        // Hide "Mi Panel" if not logged in, even if it's technically public for profile
        if (route.label === 'Mi Panel' && !userProfile) return null;
        
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === route.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}

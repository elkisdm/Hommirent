
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User, Building, MessageSquare, ShieldCheck } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function UserNav() {
  const { currentUser, userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/'); 
  };

  const showLoginSignupButtons = !currentUser && (pathname === '/' || pathname === '/properties' || pathname.startsWith('/properties/'));

  if (showLoginSignupButtons) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Registrarse</Link>
        </Button>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    // For non-public, non-auth pages, if user is not logged in, they will be caught by page/layout protection.
    // So, returning null here is fine if not on explicitly public unauthed pages.
    return null; 
  }

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={userProfile.email || 'Usuario'} />
            <AvatarFallback>{getInitials(userProfile.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile.displayName || userProfile.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {userProfile.role.replace('_', ' ')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          {userProfile.role === 'propietario' && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/landlord">
                <Building className="mr-2 h-4 w-4" />
                <span>Panel Propietario</span>
              </Link>
            </DropdownMenuItem>
          )}
          {userProfile.role === 'superadmin' && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Panel Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Asistente IA</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

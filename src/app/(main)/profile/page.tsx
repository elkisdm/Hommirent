'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { User, Mail, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]"><Spinner size="large" /></div>;
  }

  if (!currentUser || !userProfile) {
    // Should be protected by layout or redirect, but as a fallback:
    router.replace('/login');
    return <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]"><Spinner size="large" /></div>;
  }

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-24 w-24 mb-4">
            <AvatarImage src={undefined} alt={userProfile.email || 'Usuario'} />
            <AvatarFallback className="text-3xl">{getInitials(userProfile.email)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">Mi Perfil</CardTitle>
          <CardDescription>Información de tu cuenta en Hommie.cl AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-3 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{userProfile.displayName || 'No especificado'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="w-5 h-5 mr-3 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium capitalize">{userProfile.role}</p>
              </div>
            </div>
          </div>
          
          {/* <Button variant="outline" className="w-full">Editar Perfil (Próximamente)</Button> */}
          <Button variant="destructive" className="w-full" onClick={handleLogout}>Cerrar Sesión</Button>
        </CardContent>
      </Card>
    </div>
  );
}

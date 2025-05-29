'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, LayoutDashboard, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { getProperties } from '@/lib/firebase/firestore'; // Basic function
import type { Property } from '@/types';


export default function LandlordDashboardPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [propertyCount, setPropertyCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && (!userProfile || userProfile.role !== 'propietario')) {
      router.replace('/'); // Or a specific access denied page
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    if (userProfile && userProfile.role === 'propietario') {
      const fetchPropertyCount = async () => {
        setLoadingData(true);
        try {
          // This is a simplified count. For many properties, use a summary/counter doc or cloud function.
          // const properties = await getProperties({ ownerUid: userProfile.uid });
          // setPropertyCount(properties.length);
          setPropertyCount(Math.floor(Math.random() * 10)); // Mock count
        } catch (error) {
          console.error("Error fetching property count:", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchPropertyCount();
    }
  }, [userProfile]);

  if (authLoading || loadingData) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]"><Spinner size="large" /></div>;
  }

  if (!userProfile || userProfile.role !== 'propietario') {
     return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-semibold">Acceso Denegado</h2>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
        <Button onClick={() => router.push('/')} className="mt-6">Volver al Inicio</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Propietario</h1>
          <p className="text-muted-foreground">Gestiona tus propiedades y revisa estadísticas.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/landlord/properties/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva Propiedad
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedades Activas</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyCount}</div>
            <p className="text-xs text-muted-foreground">Total de propiedades publicadas</p>
          </CardContent>
        </Card>
        {/* Add more summary cards here: e.g., Intereses recibidos, Visitas agendadas (simulado) */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/landlord/properties">
              <ListChecks className="mr-2 h-4 w-4" /> Ver Mis Propiedades
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/landlord/properties/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Publicar Nueva Propiedad
            </Link>
          </Button>
          {/* More actions can be added here */}
        </CardContent>
      </Card>
    </div>
  );
}

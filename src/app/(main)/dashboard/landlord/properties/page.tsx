
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { PlusCircle, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { getProperties, deleteProperty } from '@/lib/firebase/firestore';
import { deleteFileByUrl } from '@/lib/firebase/storage';
import type { Property } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyPropertiesPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && (!userProfile || userProfile.role !== 'propietario')) {
      router.replace('/');
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    if (userProfile && userProfile.role === 'propietario') {
      const fetchMyProperties = async () => {
        setLoadingData(true);
        try {
          const props = await getProperties({ ownerUid: userProfile.uid });
          setProperties(props);
        } catch (error) {
          console.error("Error fetching landlord properties:", error);
          toast({ title: "Error", description: "No se pudieron cargar tus propiedades.", variant: "destructive" });
        } finally {
          setLoadingData(false);
        }
      };
      fetchMyProperties();
    }
  }, [userProfile, toast]);

  const handleDeleteProperty = async (propertyToDelete: Property) => {
    if (!userProfile) return;
    try {
      // First, delete images from storage
      for (const imageUrl of propertyToDelete.imageUrls) {
        try {
          await deleteFileByUrl(imageUrl);
        } catch (storageError) {
          console.warn(`Could not delete image ${imageUrl} from storage:`, storageError);
          // Decide if you want to stop deletion or continue. For now, continue.
        }
      }
      // Then, delete property document from Firestore
      await deleteProperty(propertyToDelete.propertyId);

      setProperties(prev => prev.filter(p => p.propertyId !== propertyToDelete.propertyId));
      toast({ title: "Propiedad Eliminada", description: `"${propertyToDelete.title}" ha sido eliminada.` });
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({ title: "Error", description: "No se pudo eliminar la propiedad.", variant: "destructive" });
    }
  };

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mis Propiedades</CardTitle>
          <CardDescription>Administra las propiedades que has publicado.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/landlord/properties/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Publicar Nueva
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aún no has publicado ninguna propiedad.</p>
            <Button variant="link" asChild className="mt-2"><Link href="/dashboard/landlord/properties/new">¡Publica tu primera propiedad ahora!</Link></Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Imagen</TableHead>
                <TableHead>Unidad / Título</TableHead>
                <TableHead>Condominio</TableHead>
                <TableHead>Comuna</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((prop) => (
                <TableRow key={prop.propertyId}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={prop.title}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={prop.mainImageUrl || "https://placehold.co/64x64.png"}
                      width="64"
                      data-ai-hint="property thumbnail"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{prop.title}</TableCell>
                  <TableCell>{prop.condominioName}</TableCell>
                  <TableCell>{prop.address.commune}</TableCell>
                  <TableCell>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prop.price)}</TableCell>
                  <TableCell>
                    <Badge variant={prop.status === 'disponible' ? 'default' : (prop.status === 'arrendado' ? 'secondary' : 'outline')}
                           className={prop.status === 'disponible' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                                     (prop.status === 'arrendado' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 
                                     (prop.status === 'en_revision' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : ''))}>
                      {prop.status.charAt(0).toUpperCase() + prop.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" asChild title="Ver">
                        <Link href={`/properties/${prop.propertyId}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/dashboard/landlord/properties/${prop.propertyId}/edit`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Eliminar" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente la propiedad
                              "{prop.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProperty(prop)} className="bg-destructive hover:bg-destructive/90">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

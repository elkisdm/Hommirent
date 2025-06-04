
'use client';

import { useState, useEffect } from 'react';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getPropertyById, updateProperty } from '@/lib/firebase/firestore';
import { uploadMultipleFiles, deleteFileByUrl } from '@/lib/firebase/storage';
import type { Property } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export default function EditPropertyPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;
  const { toast } = useToast();
  
  const [initialData, setInitialData] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!propertyId) return;
    const fetchPropertyData = async () => {
      setIsFetching(true);
      try {
        const property = await getPropertyById(propertyId);
        if (property && property.ownerUid === userProfile?.uid) { 
             setInitialData(property);
        } else if (property && property.ownerUid !== userProfile?.uid) {
            toast({ title: 'Acceso Denegado', description: 'No tienes permiso para editar esta propiedad.', variant: 'destructive' });
            router.push('/dashboard/landlord/properties');
        }
         else {
          toast({ title: 'Error', description: 'Propiedad no encontrada.', variant: 'destructive' });
          router.push('/dashboard/landlord/properties');
        }
      } catch (error) {
        console.error("Error fetching property for edit:", error);
        toast({ title: 'Error', description: 'No se pudo cargar la propiedad.', variant: 'destructive' });
      } finally {
        setIsFetching(false);
      }
    };

    if (userProfile) { 
        fetchPropertyData();
    } else if (!userProfile && !isFetching) { // If user is not logged in after initial check
        router.push('/login');
    }
  }, [propertyId, userProfile, router, toast, isFetching]);

  const handleSubmit = async (
    data: any, // Type from PropertyFormValues
    files: FileList | null,
    removedImageUrls: string[]
  ) => {
    if (!userProfile || userProfile.role !== 'propietario' || !initialData) {
      toast({ title: 'Error de permisos', description: 'No tienes autorización o faltan datos.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      let newImageUrls: string[] = [];
      if (files && files.length > 0) {
        newImageUrls = await uploadMultipleFiles(files, `properties/${userProfile.uid}/${propertyId}`);
      }
      
      for (const urlToDelete of removedImageUrls) {
        if (initialData.imageUrls.includes(urlToDelete)) { // Ensure we only try to delete images that were part of the initial data
          try {
            await deleteFileByUrl(urlToDelete);
          } catch (storageError) {
            console.warn(`Could not delete image ${urlToDelete} from storage:`, storageError);
          }
        }
      }

      const finalImageUrls = [...initialData.imageUrls.filter(url => !removedImageUrls.includes(url)), ...newImageUrls];
      
      if (finalImageUrls.length === 0) {
          toast({ title: 'Imágenes requeridas', description: 'La propiedad debe tener al menos una imagen.', variant: 'destructive'});
          setIsLoading(false);
          return;
      }

      const updatedPropertyData: Partial<Property> = {
        title: data.title,
        condominioName: data.condominioName,
        description: data.description,
        address: {
          street: data.street,
          number: data.number,
          commune: data.commune,
          city: data.city,
          region: data.region,
          coordinates: initialData.address.coordinates, 
        },
        price: data.price,
        currency: data.currency,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        areaSqMeters: data.areaSqMeters,
        amenities: data.amenities,
        imageUrls: finalImageUrls,
        mainImageUrl: finalImageUrls[0] || '', // Ensure mainImageUrl is not empty
        status: data.status,
        // virtualTourUrl can be added if part of the form
      };
      
      await updateProperty(propertyId, updatedPropertyData);
      
      toast({ title: 'Propiedad Actualizada', description: 'Los cambios en tu propiedad han sido guardados.' });
      router.push(`/dashboard/landlord/properties`);
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({ title: 'Error al Actualizar', description: error.message || 'No se pudo guardar los cambios.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching || !userProfile) { 
    return <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]"><Spinner size="large" /></div>;
  }

  if (!initialData) {
      return <div className="text-center py-10"><p className="text-muted-foreground">Cargando datos de la propiedad o redirigiendo...</p></div>;
  }


  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Propiedad</CardTitle>
          <CardDescription>Modifica los detalles de tu propiedad.</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm 
            initialData={initialData} 
            onSubmitForm={handleSubmit} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

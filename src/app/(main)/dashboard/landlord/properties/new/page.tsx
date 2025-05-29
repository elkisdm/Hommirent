'use client';

import { useState } from 'react';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createProperty } from '@/lib/firebase/firestore';
import { uploadMultipleFiles } from '@/lib/firebase/storage';
import type { Property } from '@/types';
import { Timestamp } from 'firebase/firestore';

type PropertyFormData = Omit<Property, 'propertyId' | 'ownerUid' | 'createdAt' | 'updatedAt' | 'imageUrls' | 'mainImageUrl'> & {
  street: string;
  number?: string;
  commune: string;
  city: string;
  region: string;
};


export default function NewPropertyPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    data: any, // Type from PropertyFormValues
    files: FileList | null
  ) => {
    if (!userProfile || userProfile.role !== 'propietario') {
      toast({ title: 'Error de permisos', description: 'No tienes autorización.', variant: 'destructive' });
      return;
    }
    if (!files || files.length === 0) {
      toast({ title: 'Imágenes requeridas', description: 'Debes subir al menos una imagen.', variant: 'destructive'});
      return;
    }

    setIsLoading(true);
    try {
      const imageUrls = await uploadMultipleFiles(files, `properties/${userProfile.uid}`);
      if (imageUrls.length === 0) {
        throw new Error("No se pudieron subir las imágenes.");
      }

      const propertyData: Omit<Property, 'propertyId' | 'createdAt' | 'updatedAt'> = {
        ownerUid: userProfile.uid,
        title: data.title,
        description: data.description,
        address: {
          street: data.street,
          number: data.number,
          commune: data.commune,
          city: data.city,
          region: data.region,
        },
        price: data.price,
        currency: data.currency,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        areaSqMeters: data.areaSqMeters,
        amenities: data.amenities,
        imageUrls,
        mainImageUrl: imageUrls[0], // First image as main
        status: data.status,
        // createdAt and updatedAt will be set by serverTimestamp in createProperty
      };
      
      // Forcing type assertion to match Property for createProperty
      const finalPropertyData = {
        ...propertyData,
        // Ensure all fields expected by Omit<Property, 'propertyId' | 'createdAt' | 'updatedAt'> are present
        // Some fields like virtualTourUrl can be optional
      } as Omit<Property, 'propertyId' | 'createdAt' | 'updatedAt'>;


      const propertyId = await createProperty(finalPropertyData);
      
      toast({ title: 'Propiedad Publicada', description: 'Tu propiedad ha sido creada exitosamente.' });
      router.push(`/dashboard/landlord/properties`); // Or to the new property's page: /properties/${propertyId}
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast({ title: 'Error al Publicar', description: error.message || 'No se pudo crear la propiedad.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Publicar Nueva Propiedad</CardTitle>
          <CardDescription>Completa los detalles de tu propiedad para publicarla en Hommie.cl AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm onSubmitForm={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

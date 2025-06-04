
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from './ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Property } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Timestamp } from 'firebase/firestore';

const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
  condominioName: z.string().min(3, { message: 'El nombre del proyecto/edificio debe tener al menos 3 caracteres.'}),
  description: z.string().min(20, { message: 'La descripción debe tener al menos 20 caracteres.' }),
  street: z.string().min(3, { message: 'Ingresa la calle.' }),
  number: z.string().optional(),
  commune: z.string().min(3, { message: 'Ingresa la comuna.' }),
  city: z.string().min(3, { message: 'Ingresa la ciudad.' }),
  region: z.string().min(3, { message: 'Ingresa la región.' }),
  price: z.coerce.number().min(1, { message: 'El precio debe ser mayor a 0.' }),
  currency: z.string().default('CLP'),
  bedrooms: z.coerce.number().min(0, { message: 'El número de dormitorios no puede ser negativo.' }),
  bathrooms: z.coerce.number().min(0, { message: 'El número de baños no puede ser negativo.' }),
  areaSqMeters: z.coerce.number().min(1, { message: 'La superficie debe ser mayor a 0 m².' }),
  amenities: z.array(z.string()).optional().default([]),
  status: z.enum(['disponible', 'arrendado', 'en_revision']).default('disponible'),
  // Images are handled separately
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  initialData?: Property | null; // For editing
  onSubmitForm: (data: PropertyFormValues, files: FileList | null, removedImageUrls: string[]) => Promise<void>;
  isLoading?: boolean;
}

const allAmenities = [
  { id: 'piscina', label: 'Piscina' },
  { id: 'estacionamiento', label: 'Estacionamiento' },
  { id: 'bodega', label: 'Bodega' },
  { id: 'pet-friendly', label: 'Pet-friendly' },
  { id: 'gimnasio', label: 'Gimnasio' },
  { id: 'quincho', label: 'Quincho' },
  { id: 'conserjeria', label: 'Conserjería 24/7' },
  { id: 'ascensor', label: 'Ascensor' },
  { id: 'amoblado', label: 'Amoblado' },
];


export function PropertyForm({ initialData, onSubmitForm, isLoading }: PropertyFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(initialData?.imageUrls || []);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);


  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData ? {
        title: initialData.title,
        condominioName: initialData.condominioName || '',
        description: initialData.description,
        street: initialData.address.street,
        number: initialData.address.number,
        commune: initialData.address.commune,
        city: initialData.address.city,
        region: initialData.address.region,
        price: initialData.price,
        currency: initialData.currency,
        bedrooms: initialData.bedrooms,
        bathrooms: initialData.bathrooms,
        areaSqMeters: initialData.areaSqMeters,
        amenities: initialData.amenities,
        status: initialData.status,
    } : {
      title: '',
      condominioName: '',
      description: '',
      street: '',
      number: '',
      commune: '',
      city: 'Santiago', // Default city
      region: 'Metropolitana', // Default region
      price: 0,
      currency: 'CLP',
      bedrooms: 0,
      bathrooms: 0,
      areaSqMeters: 0,
      status: 'disponible',
      amenities: [],
    },
  });

  const handleFormSubmit = async (values: PropertyFormValues) => {
    if (!userProfile || userProfile.role !== 'propietario') {
      toast({ title: 'Error', description: 'No tienes permiso para realizar esta acción.', variant: 'destructive' });
      return;
    }
    // Check if there are new files OR existing images that are NOT in the removedImageUrls list
    const hasNewFiles = selectedFiles && selectedFiles.length > 0;
    const remainingExistingImages = existingImageUrls.filter(url => !removedImageUrls.includes(url));
    
    if (!hasNewFiles && remainingExistingImages.length === 0 && !initialData?.imageUrls?.some(url => !removedImageUrls.includes(url))) {
        toast({ title: 'Imágenes requeridas', description: 'Debes subir o mantener al menos una imagen de la propiedad.', variant: 'destructive'});
        return;
    }
    await onSubmitForm(values, selectedFiles, removedImageUrls);
  };
  
  const handleFilesChange = (files: FileList | null) => {
    setSelectedFiles(files);
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(imgUrl => imgUrl !== url));
    setRemovedImageUrls(prev => [...prev, url]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Propiedad / Unidad</FormLabel>
              <FormControl><Input placeholder="Ej: Departamento 305B, Casa con Jardín" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condominioName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Proyecto / Edificio</FormLabel>
              <FormControl><Input placeholder="Ej: Edificio Central Park, Condominio Las Flores" {...field} /></FormControl>
              <FormDescription>Si es una casa individual, puedes repetir el título o la dirección aquí.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción de la Unidad</FormLabel>
              <FormControl><Textarea placeholder="Describe tu propiedad en detalle..." rows={5} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
            <FormLabel>Dirección del Proyecto / Edificio</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="street" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Calle</FormLabel><FormControl><Input placeholder="Av. Principal" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="number" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Número / Depto (Opcional)</FormLabel><FormControl><Input placeholder="123, Depto 4B" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="commune" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Comuna</FormLabel><FormControl><Input placeholder="Providencia" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Ciudad</FormLabel><FormControl><Input placeholder="Santiago" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="region" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Región</FormLabel><FormControl><Input placeholder="Metropolitana" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>Precio (CLP)</FormLabel><FormControl><Input type="number" placeholder="500000" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="bedrooms" render={({ field }) => ( <FormItem><FormLabel>Dormitorios</FormLabel><FormControl><Input type="number" placeholder="2" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="bathrooms" render={({ field }) => ( <FormItem><FormLabel>Baños</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="areaSqMeters" render={({ field }) => ( <FormItem><FormLabel>Superficie (m²)</FormLabel><FormControl><Input type="number" placeholder="70" {...field} /></FormControl><FormMessage /></FormItem> )} />
        </div>

        <FormField
          control={form.control}
          name="amenities"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Comodidades de la Unidad / Proyecto</FormLabel>
                <FormDescription>Selecciona las comodidades que ofrece la propiedad.</FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allAmenities.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="amenities"
                  render={({ field }) => {
                    return (
                      <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange( (field.value || []).filter( (value) => value !== item.id ) );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item.label}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>Imágenes de la Unidad</FormLabel>
            <ImageUpload 
                onFilesChange={handleFilesChange} 
                existingImageUrls={existingImageUrls}
                onRemoveExistingImage={handleRemoveExistingImage}
            />
            <FormDescription>Sube fotos atractivas de la unidad. La primera imagen será la principal.</FormDescription>
        </FormItem>


        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de la Unidad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="arrendado">Arrendado</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? <Spinner size="small" className="mr-2"/> : null}
          {initialData ? 'Actualizar Propiedad' : 'Publicar Propiedad'}
        </Button>
      </form>
    </Form>
  );
}

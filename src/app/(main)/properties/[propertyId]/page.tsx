'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { MapPin, BedDouble, Bath, Square, Tag, CheckCircle, XCircle, AlertTriangle, Building, UserCircle, MessageSquare } from 'lucide-react'; // Changed RulerSquare to Square
import type { Property, Interest } from '@/types';
import { db, auth } from '@/lib/firebase/config';
import { doc, getDoc, serverTimestamp, addDoc, collection, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Mock data for a single property, replace with Firestore fetching
const mockProperty: Property = {
  propertyId: 'prop-1',
  ownerUid: 'owner-1',
  title: 'Lujoso Penthouse con Vista Panorámica',
  description: 'Espectacular penthouse en el corazón de la ciudad, con acabados de lujo, amplias terrazas y vistas inigualables. Cuenta con sistema de domótica, jacuzzi privado y acceso directo desde el ascensor. Cercano a los mejores restaurantes, tiendas y parques. Una oportunidad única para vivir con estilo y comodidad.',
  address: {
    street: 'Av. Vitacura 2900',
    number: 'Piso 20',
    commune: 'Las Condes',
    city: 'Santiago',
    region: 'Metropolitana',
  },
  price: 2500000,
  currency: 'CLP',
  bedrooms: 4,
  bathrooms: 4,
  areaSqMeters: 350,
  amenities: ['piscina temperada', 'estacionamiento subterráneo (3)', 'bodega amplia', 'pet-friendly', 'gimnasio equipado', 'sala de eventos', 'seguridad 24/7', 'terraza panorámica'],
  imageUrls: [
    'https://placehold.co/1200x800.png?text=Penthouse+Vista+1',
    'https://placehold.co/1200x800.png?text=Penthouse+Vista+2',
    'https://placehold.co/1200x800.png?text=Penthouse+Living',
    'https://placehold.co/1200x800.png?text=Penthouse+Dormitorio',
    'https://placehold.co/1200x800.png?text=Penthouse+Baño',
  ],
  mainImageUrl: 'https://placehold.co/1200x800.png?text=Penthouse+Principal',
  status: 'disponible',
  virtualTourUrl: 'https://my.matterport.com/show/?m=DEMOID', // Example URL
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};


export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);

  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!propertyId) return;

    const fetchProperty = async () => {
      setLoading(true);
      try {
        // const propertyDoc = doc(db, 'properties', propertyId);
        // const docSnap = await getDoc(propertyDoc);
        // if (docSnap.exists()) {
        //   setProperty({ propertyId: docSnap.id, ...docSnap.data() } as Property);
        // } else {
        //   console.error("No such document!");
        //   router.push('/404'); // Or show a not found message
        // }
        setProperty(mockProperty); // Using mock data for now
      } catch (error) {
        console.error("Error fetching property: ", error);
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  const nextImage = () => {
    if (!property) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.imageUrls.length);
  };

  const prevImage = () => {
    if (!property) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.imageUrls.length) % property.imageUrls.length);
  };
  
  const handleExpressInterest = async () => {
    if (!currentUser || !userProfile) {
      toast({ title: "Debes iniciar sesión", description: "Para expresar interés, por favor inicia sesión o regístrate.", variant: "destructive" });
      router.push(`/login?redirect=/properties/${propertyId}`);
      return;
    }

    if (userProfile.role !== 'arrendatario') {
      toast({ title: "Acción no permitida", description: "Solo los arrendatarios pueden expresar interés.", variant: "destructive" });
      return;
    }
    
    if (!property) return;

    setIsExpressingInterest(true);
    try {
      const interestData: Omit<Interest, 'interestId' | 'createdAt'> = {
        propertyId: property.propertyId,
        tenantUid: currentUser.uid,
        ownerUid: property.ownerUid,
        status: 'pendiente',
        // message: "Optional message here" // Could add a small modal for a message
      };
      // await addDoc(collection(db, 'interests'), {
      //   ...interestData,
      //   createdAt: serverTimestamp(),
      // });
      
      // Simulating saving interest
      console.log("Interest expressed (simulated):", interestData);

      toast({
        title: "¡Interés expresado!",
        description: "El propietario ha sido notificado de tu interés. (Simulado)",
      });
    } catch (error) {
      console.error("Error expressing interest:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar tu interés. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsExpressingInterest(false);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]"><Spinner size="large" /></div>;
  }

  if (!property) {
    return <div className="text-center py-10">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-2xl font-semibold">Propiedad no encontrada</h2>
      <p className="text-muted-foreground">La propiedad que buscas no existe o no está disponible.</p>
      <Button onClick={() => router.push('/properties')} className="mt-6">Volver a Propiedades</Button>
    </div>;
  }

  const currentImageUrl = property.imageUrls[currentImageIndex] || property.mainImageUrl;

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="p-0 relative">
          {property.imageUrls && property.imageUrls.length > 0 && (
            <div className="relative h-72 md:h-96 w-full">
              <Image
                src={currentImageUrl}
                alt={`${property.title} - imagen ${currentImageIndex + 1}`}
                layout="fill"
                objectFit="cover"
                priority
                data-ai-hint="apartment interior"
              />
              {property.imageUrls.length > 1 && (
                <>
                  <Button onClick={prevImage} variant="outline" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none">{'<'}</Button>
                  <Button onClick={nextImage} variant="outline" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none">{'>'}</Button>
                </>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{property.title}</CardTitle>
              <div className="flex items-center text-lg text-muted-foreground mt-1">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                {property.address.street}{property.address.number ? `, ${property.address.number}` : ''}, {property.address.commune}, {property.address.city}
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-left md:text-right">
               <p className="text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
               <p className="text-sm text-muted-foreground">{property.currency} / Mensual</p>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-3">Características Principales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-md">
              <div className="flex items-center"><BedDouble className="w-5 h-5 mr-2 text-primary" /> {property.bedrooms} Dormitorios</div>
              <div className="flex items-center"><Bath className="w-5 h-5 mr-2 text-primary" /> {property.bathrooms} Baños</div>
              <div className="flex items-center"><Square className="w-5 h-5 mr-2 text-primary" /> {property.areaSqMeters} m²</div>
              <div className="flex items-center">
                {property.status === 'disponible' ? <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> : <XCircle className="w-5 h-5 mr-2 text-red-500" />}
                Estado: <span className={`font-medium ml-1 ${property.status === 'disponible' ? 'text-green-600' : 'text-red-600'}`}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold mb-3">Comodidades</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-sm bg-secondary/50 p-2 rounded-md">
                      <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {property.virtualTourUrl && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold mb-3">Tour Virtual</h3>
                <Button variant="outline" asChild>
                  <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                    <Building className="mr-2 h-4 w-4" /> Ver Tour Virtual
                  </a>
                </Button>
              </div>
            </>
          )}
          
          <Separator />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-1" 
              onClick={handleExpressInterest}
              disabled={isExpressingInterest || property.status !== 'disponible'}
            >
              {isExpressingInterest ? <Spinner size="small" className="mr-2" /> : <MessageSquare className="mr-2 h-5 w-5" /> }
              {property.status === 'disponible' ? 'Me Interesa / Agendar Visita (Simulado)' : 'No Disponible'}
            </Button>
            {/* Placeholder for owner contact info or button */}
            {/* <Button variant="outline" size="lg" className="flex-1">
              <UserCircle className="mr-2 h-5 w-5" /> Contactar Propietario (Próximamente)
            </Button> */}
          </div>
          {property.status !== 'disponible' && (
            <p className="text-center text-sm text-amber-600 mt-2">Esta propiedad no se encuentra disponible actualmente.</p>
          )}

        </CardContent>
      </Card>

      {/* Placeholder for map */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Ubicación Aproximada</CardTitle>
          <CardDescription>La dirección exacta se comparte al coordinar una visita.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">(Mapa Placeholder - Integración futura)</p>
            <Image src="https://placehold.co/800x400.png?text=Mapa+Placeholder" alt="Mapa Placeholder" data-ai-hint="map location" width={800} height={400} className="opacity-50 aspect-[2/1] object-cover" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

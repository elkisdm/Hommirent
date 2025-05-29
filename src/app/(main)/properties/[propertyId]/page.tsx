
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { 
  MapPin, BedDouble, Bath, Square, AlertTriangle, Building, MessageSquare, Home,
  ChevronLeft, ChevronRight, Heart, ParkingCircle, Archive, Film, Map as MapIcon, Share2, ShieldCheck,
  CheckCircle, Info, CalendarDays, ShoppingBag, Train, School, Hospital, Wallet, FileText, Users
} from 'lucide-react';
import type { Property, Interest } from '@/types';
import { db, auth } from '@/lib/firebase/config';
import { doc, getDoc, serverTimestamp, addDoc, collection, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Mock data for a single property, replace with Firestore fetching
const mockProperty: Property = {
  propertyId: 'prop-1',
  ownerUid: 'owner-1',
  title: 'Luminoso Departamento de 2 Dormitorios con Terraza y Vista Despejada en Providencia',
  condominioName: 'Condominio Vista Azul',
  description: 'Disfruta de atardeceres inolvidables desde su amplia terraza en este espectacular departamento en el corazón de Providencia. Con acabados de lujo, amplios espacios y vistas inigualables, esta propiedad ofrece un estilo de vida moderno y cómodo. Cercano a los mejores restaurantes, tiendas y parques, representa una oportunidad única.\n\nEl departamento cuenta con una excelente distribución, cocina moderna integrada y equipada, y dormitorios espaciosos con closets. El edificio ofrece seguridad 24/7 y excelentes amenidades para toda la familia.',
  address: {
    street: 'Las Violetas 123',
    number: 'Depto 1001',
    commune: 'Providencia',
    city: 'Santiago',
    region: 'Metropolitana',
  },
  price: 750000,
  currency: 'CLP',
  bedrooms: 2,
  bathrooms: 2,
  areaSqMeters: 95, // total
  // areaUtilesSqMeters: 85, // Placeholder
  amenities: ['piscina temperada', 'estacionamiento subterráneo', 'bodega amplia', 'pet-friendly', 'gimnasio equipado', 'sala de eventos', 'seguridad 24/7', 'terraza panorámica común', 'bicicletero', 'accesos controlados', 'ascensor', 'juegos infantiles', 'áreas verdes'],
  imageUrls: [
    'https://placehold.co/1200x800.png?text=Depto+Providencia+Principal',
    'https://placehold.co/1200x800.png?text=Depto+Living',
    'https://placehold.co/1200x800.png?text=Depto+Dormitorio+1',
    'https://placehold.co/1200x800.png?text=Depto+Cocina',
    'https://placehold.co/1200x800.png?text=Depto+Baño+1',
    'https://placehold.co/1200x800.png?text=Depto+Terraza',
    'https://placehold.co/1200x800.png?text=Edificio+Fachada',
  ],
  mainImageUrl: 'https://placehold.co/1200x800.png?text=Depto+Providencia+Principal',
  status: 'disponible',
  virtualTourUrl: 'https://my.matterport.com/show/?m=DEMOID', // Example URL
  // planosUrl: 'https://placehold.co/800x600.png?text=Plano+Depto', // Placeholder
  // anoConstruccion: 2018, // Placeholder
  // orientacion: 'Nororiente', // Placeholder
  // tipoPiso: 'Flotante y Porcelanato', // Placeholder
  // tipoVentanas: 'Termopanel', // Placeholder
  // tipoCocina: 'Americana, Equipada', // Placeholder
  // logia: true, // Placeholder
  // walkInCloset: true, // Placeholder
  // calefaccion: 'Losa radiante', // Placeholder
  // aireAcondicionado: false, // Placeholder
  // politicaMascotas: 'Sí, conversable', // Placeholder
  // disponibilidad: 'Inmediata', // Placeholder
  // gastosComunesAprox: 120000, // Placeholder
  // incluyeEnGastosComunes: 'Agua caliente central, mantención áreas comunes', // Placeholder
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
  const [isFavorite, setIsFavorite] = useState(false); // Placeholder state

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
        //   router.push('/404');
        // }
        setProperty(mockProperty); 
      } catch (error) {
        console.error("Error fetching property: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: currency }).format(price);
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
      // Simulating saving interest
      console.log("Interest expressed (simulated)");
      toast({ title: "¡Interés expresado!", description: "El propietario ha sido notificado. (Simulado)" });
    } catch (error) {
      console.error("Error expressing interest:", error);
      toast({ title: "Error", description: "No se pudo registrar tu interés.", variant: "destructive" });
    } finally {
      setIsExpressingInterest(false);
    }
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite); // Placeholder

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
  const hasParking = property.amenities.some(a => a.toLowerCase().includes('estacionamiento'));
  const hasBodega = property.amenities.some(a => a.toLowerCase().includes('bodega'));

  // Mock data for fields not in current model
  const mockData = {
    areaUtilesSqMeters: property.areaSqMeters - 10 > 0 ? property.areaSqMeters -10 : property.areaSqMeters, // example
    anoConstruccion: 2020,
    orientacion: 'Nororiente',
    tipoPiso: 'Porcelanato y flotante',
    tipoVentanas: 'Termopanel',
    tipoCocina: 'Integrada y equipada',
    logia: true,
    walkInCloset: true,
    calefaccion: 'Losa radiante',
    aireAcondicionado: false,
    politicaMascotas: 'Sí, se aceptan (consultar condiciones)',
    disponibilidad: 'Inmediata',
    gastosComunesAprox: 135000,
    incluyeEnGastosComunes: 'Agua caliente, mantención áreas comunes',
    comisionArrendatario: '50% + IVA de un mes de arriendo',
    requisitos: [
      'Cédula de identidad vigente',
      'Contrato de trabajo indefinido o últimas 6 boletas (independientes)',
      'Últimas 3 liquidaciones de sueldo (renta 3x valor arriendo)',
      'Certificado AFP (últimas 12 cotizaciones)',
      'Informe Dicom Platinium 360 o Arriendo Perfecto',
      'Aval podría ser requerido según evaluación',
    ]
  };


  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Breadcrumbs Placeholder */}
      {/* <div className="mb-4 text-sm text-muted-foreground">Inicio &gt; Arriendos en {property.address.commune} &gt; Detalle</div> */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column (Gallery, Details) - Col span 2 on LG */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Section */}
          <section>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
              <Button variant="ghost" size="icon" onClick={toggleFavorite} title="Guardar Favorito">
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </Button>
            </div>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              {property.address.street}{property.address.number ? `, ${property.address.number}` : ''}, {property.address.commune}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center"><BedDouble className="w-4 h-4 mr-1.5 text-primary" /> {property.bedrooms} Dormitorios</span>
              <span className="flex items-center"><Bath className="w-4 h-4 mr-1.5 text-primary" /> {property.bathrooms} Baños</span>
              <span className="flex items-center"><Square className="w-4 h-4 mr-1.5 text-primary" /> {property.areaSqMeters} m² Totales</span>
              {/* <span className="flex items-center"><Square className="w-4 h-4 mr-1.5 text-primary" /> {mockData.areaUtilesSqMeters} m² Útiles</span> */}
              {hasParking && <span className="flex items-center"><ParkingCircle className="w-4 h-4 mr-1.5 text-primary" /> Estacionamiento</span>}
              {hasBodega && <span className="flex items-center"><Archive className="w-4 h-4 mr-1.5 text-primary" /> Bodega</span>}
            </div>
          </section>

          {/* Multimedia Gallery Section */}
          <section>
            {property.imageUrls && property.imageUrls.length > 0 && (
              <div className="relative group">
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={currentImageUrl}
                    alt={`${property.title} - imagen ${currentImageIndex + 1}`}
                    layout="fill"
                    objectFit="cover"
                    priority
                    data-ai-hint="apartment interior stylish"
                  />
                </AspectRatio>
                {property.imageUrls.length > 1 && (
                  <>
                    <Button onClick={prevImage} variant="outline" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white border-none shadow-md">
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button onClick={nextImage} variant="outline" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white border-none shadow-md">
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
                 <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {property.imageUrls.length}
                </div>
              </div>
            )}
            {/* Miniaturas y botones de Tour/Planos */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {/* Miniaturas - Placeholder */}
              {/* {property.imageUrls.slice(0,5).map((url, idx) => (
                <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-16 rounded overflow-hidden border-2 ${currentImageIndex === idx ? 'border-primary' : 'border-transparent'}`}>
                  <Image src={url} alt={`Thumb ${idx}`} layout="fill" objectFit="cover" />
                </button>
              ))} */}
              {property.virtualTourUrl && (
                <Button variant="outline" asChild>
                  <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                    <Film className="mr-2 h-4 w-4" /> Tour Virtual 360°
                  </a>
                </Button>
              )}
              {/* Placeholder para Planos */}
              <Button variant="outline" disabled>
                <MapIcon className="mr-2 h-4 w-4" /> Ver Plano(s) (Próximamente)
              </Button>
            </div>
          </section>

          <Separator />

          {/* Descripción Detallada Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Acerca de esta Propiedad</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{property.description}</p>
          </section>

          <Separator />

          {/* Características Principales Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Características Principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-muted-foreground">
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Tipo de Propiedad: Departamento</span></div>
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Año Construcción: {mockData.anoConstruccion} (Estimado)</span></div>
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Orientación: {mockData.orientacion}</span></div>
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Piso: {property.address.number?.split(' ')[1] || 'No especificado'}</span></div>
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Tipo de Piso: {mockData.tipoPiso}</span></div>
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Ventanas: {mockData.tipoVentanas}</span></div>
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Cocina: {mockData.tipoCocina}</span></div>
              {mockData.logia && <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Logia Incluida</span></div>}
              {mockData.walkInCloset && <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Walk-in Closet</span></div>}
              <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Calefacción: {mockData.calefaccion}</span></div>
              {mockData.aireAcondicionado && <div className="flex items-start"><Info className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Aire Acondicionado</span></div>}
            </div>
          </section>

          {property.amenities && property.amenities.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="text-2xl font-semibold mb-4">Amenidades del Edificio / Condominio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-5 h-5 mr-2 text-primary shrink-0" />
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          
          <Separator />
          {/* Información Adicional Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Información Adicional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-muted-foreground">
              <div className="flex items-start"><CheckCircle className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Política de Mascotas: {mockData.politicaMascotas}</span></div>
              <div className="flex items-start"><CalendarDays className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span>Disponibilidad: {mockData.disponibilidad}</span></div>
            </div>
          </section>

          <Separator />
           {/* Ubicación y Entorno Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Ubicación y Entorno</h2>
            <Card>
              <CardContent className="p-0">
                <AspectRatio ratio={16/9} className="bg-muted rounded-md flex items-center justify-center">
                  <Image src="https://placehold.co/800x450.png?text=Mapa+Interactivo+Placeholder" alt="Mapa Placeholder" data-ai-hint="map location city" layout="fill" objectFit="cover" className="rounded-md opacity-70" />
                   <p className="z-10 text-lg font-semibold text-background bg-black/50 p-2 rounded">Mapa (Integración futura)</p>
                </AspectRatio>
              </CardContent>
            </Card>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Puntos de Interés Cercanos (Ejemplos)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                <span className="flex items-center"><Train className="w-4 h-4 mr-1.5 text-primary"/> Metro Los Leones</span>
                <span className="flex items-center"><ShoppingBag className="w-4 h-4 mr-1.5 text-primary"/> Costanera Center</span>
                <span className="flex items-center"><School className="w-4 h-4 mr-1.5 text-primary"/> Colegio San Ignacio</span>
                <span className="flex items-center"><Hospital className="w-4 h-4 mr-1.5 text-primary"/> Clínica Indisa</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-primary"/> Parque de las Esculturas</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">El barrio de {property.address.commune} es conocido por su excelente conectividad, seguridad y vibrante vida urbana, con acceso a parques, ciclovías y una amplia oferta gastronómica y cultural.</p>
            </div>
          </section>

          <Separator />
          {/* Costos y Requisitos Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Costos y Requisitos Para Arrendar</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-xl">Resumen de Costos Iniciales</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-muted-foreground">
                  <p><Wallet className="inline w-4 h-4 mr-1.5 text-primary" /> Mes de arriendo: {formatPrice(property.price, property.currency)}</p>
                  <p><Wallet className="inline w-4 h-4 mr-1.5 text-primary" /> Mes de garantía: {formatPrice(property.price, property.currency)} (1 mes)</p>
                  <p><Wallet className="inline w-4 h-4 mr-1.5 text-primary" /> Comisión: {mockData.comisionArrendatario}</p>
                  <p><Wallet className="inline w-4 h-4 mr-1.5 text-primary" /> Gastos notariales: Aprox. $25.000 CLP (Referencial)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">Requisitos Principales</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-muted-foreground">
                  {mockData.requisitos.map((req, i) => (
                     <p key={i}><FileText className="inline w-4 h-4 mr-1.5 text-primary" /> {req}</p>
                  ))}
                   <p className="text-xs mt-2">*Pueden aplicar otros requisitos o variaciones según evaluación.</p>
                </CardContent>
              </Card>
            </div>
          </section>

        </div>

        {/* Right/Sidebar Column (Price, CTA) - Col span 1 on LG */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{formatPrice(property.price, property.currency)}</p>
                <p className="text-sm text-muted-foreground">/ Mes</p>
              </div>
              <div className="text-center">
                 <p className="font-semibold text-md">Gastos Comunes: {formatPrice(mockData.gastosComunesAprox, property.currency)} aprox.</p>
                 <p className="text-xs text-muted-foreground">({mockData.incluyeEnGastosComunes})</p>
              </div>
              <Separator />
              <Button 
                size="lg" 
                className="w-full text-lg py-6" 
                onClick={handleExpressInterest}
                disabled={isExpressingInterest || property.status !== 'disponible'}
              >
                {isExpressingInterest ? <Spinner size="small" className="mr-2"/> : <MessageSquare className="mr-2 h-5 w-5" /> }
                {property.status === 'disponible' ? 'Agendar Visita' : 'No Disponible'}
              </Button>
              {property.status !== 'disponible' && (
                <p className="text-center text-sm text-destructive mt-2">Esta propiedad no se encuentra disponible.</p>
              )}
              <Button variant="outline" size="lg" className="w-full" disabled>
                <Users className="mr-2 h-5 w-5" /> Contactar (Próximamente)
              </Button>
              <Separator />
              <div className="text-center">
                {/* Placeholder para info del publicador */}
                <p className="text-sm font-medium">Publicado por Hommie.cl Agente</p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                    <ShieldCheck className="mr-1.5 h-4 w-4 text-green-600"/> Propiedad Verificada
                </Badge>
              </div>
              <div className="flex justify-center space-x-2 mt-2">
                  <Button variant="outline" size="icon" title="Compartir" disabled><Share2 className="h-5 w-5"/></Button>
                  {/* Otros botones de compartir */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

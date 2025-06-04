
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  MapPin, BedDouble, Bath, Square, AlertTriangle, Building, MessageSquare, Home,
  ChevronLeft, ChevronRight, Heart, ParkingCircle, Archive, Film, Map as MapIcon, Share2, ShieldCheck,
  CheckCircle, Info, CalendarDays, ShoppingBag, Train, School, Hospital, Wallet, FileText, Users,
  CalendarClock, Compass, Layers, RectangleHorizontal as WindowIcon, ChefHat, WashingMachine, Shirt, ThermometerSun, Wind, Palette, Building2, LayoutGrid, Snowflake, Heater,
  Repeat, Bot, Waves, Dumbbell, Bike, ArrowUpDown, Trees, Dog, PawPrint, PartyPopper, KeyRound, Puzzle, Leaf, Speaker, Tv, Wifi, Utensils, Sofa, AirVent, Package, MountainSnow, Sun, View, Lightbulb, MessageCircleQuestion,
} from 'lucide-react';
import type { Property } from '@/types';
// import { db } from '@/lib/firebase/config'; // Firebase imports commented out
// import { doc, getDoc, serverTimestamp, addDoc, collection, Timestamp } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Keep for mock data type
// import { useAuth } from '@/hooks/useAuth'; // No longer needed for this specific action
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AIChatClient } from '@/components/chat/AIChatClient';
import { FirstPaymentCalculator } from '@/components/properties/FirstPaymentCalculator';
import { VisitRequestDialog } from '@/components/properties/VisitRequestDialog';


// Mock data for a single property, replace with Firestore fetching
const mockProperty: Property = {
  propertyId: 'prop-1',
  ownerUid: 'owner-1',
  title: 'Luminoso Departamento de 2 Dormitorios con Terraza y Vista Despejada en Providencia', // Original title for metadata or fallback
  condominioName: 'Vista Azul', // Example: Could be "Edificio Vista Azul" or just "Vista Azul"
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
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

const motivationalMessages = [
  "¿Alguna duda? ¡Pregúntame!",
  "¿Sabías que Providencia tiene muchas ciclovías?",
  "Estoy aquí para ayudarte.",
  "Consulta sobre esta propiedad.",
  "¿Qué te parece esta comuna?",
];


export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false); // Placeholder state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentFabMessageIndex, setCurrentFabMessageIndex] = useState(0);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);


  // const { currentUser, userProfile } = useAuth(); // Not needed for this action anymore
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFabMessageIndex((prevIndex) => (prevIndex + 1) % motivationalMessages.length);
    }, 7000); // Change message every 7 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!propertyId) return;

    const fetchProperty = async () => {
      setLoading(true);
      try {
        // const propertyDocRef = doc(db, 'properties', propertyId);
        // const propertyDoc = await getDoc(propertyDocRef);
        // if (propertyDoc.exists()) {
        //   setProperty({ propertyId: propertyDoc.id, ...propertyDoc.data() } as Property);
        // } else {
        //   toast({ title: "Error", description: "Propiedad no encontrada.", variant: "destructive" });
        //   router.push('/properties');
        // }
        setProperty(mockProperty); // Using mock data for now
      } catch (error) {
        console.error("Error fetching property: ", error);
        toast({ title: "Error", description: "No se pudo cargar la propiedad.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router, toast]);

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

  const handleScheduleVisit = () => {
    if (!property || property.status !== 'disponible') {
        toast({ title: "No Disponible", description: "Esta propiedad no está disponible para visitas en este momento.", variant: "destructive"});
        return;
    }
    setIsVisitDialogOpen(true);
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);

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
  const derivedTypology = `${property.bedrooms}D-${property.bathrooms}B`;

  let unitIdentifier = property.address.number;
  if (unitIdentifier) {
      const parts = unitIdentifier.split(' ');
      if (parts.length > 1 && (parts[0].toLowerCase() === 'depto' || parts[0].toLowerCase() === 'oficina' || parts[0].toLowerCase() === 'casa' || parts[0].toLowerCase() === 'unidad')) {
          unitIdentifier = parts.slice(1).join(' ');
      }
  } else {
      unitIdentifier = 'N/E'; // No especificado
  }
  const displayTitle = `Dpto N° ${unitIdentifier} ${property.condominioName} - ${derivedTypology}`;


  const mockData = { // These would ideally come from property object if schema extended
    areaUtilesSqMeters: property.areaSqMeters - 10 > 0 ? property.areaSqMeters -10 : property.areaSqMeters,
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
  
  const unitHighlights = [
    { label: 'Amplia Terraza', icon: Sun, present: property.description.toLowerCase().includes('terraza') || property.amenities.some(a => a.toLowerCase().includes('terraza')) },
    { label: 'Cocina Equipada', icon: ChefHat, present: mockData.tipoCocina.toLowerCase().includes('equipada') },
    { label: 'Ventanas Termopanel', icon: WindowIcon, present: mockData.tipoVentanas.toLowerCase().includes('termopanel') },
    { label: 'Pet-Friendly', icon: PawPrint, present: property.amenities.some(a => a.toLowerCase().includes('pet-friendly')) || mockData.politicaMascotas.toLowerCase().includes('sí') },
    { label: 'Walk-in Closet', icon: Shirt, present: mockData.walkInCloset },
  ].filter(h => h.present);


  const mainCharacteristics = [
    { label: 'Tipo de Propiedad', value: `Departamento`, icon: Building2 },
    { label: 'Año Construcción', value: `${mockData.anoConstruccion} (Estimado)`, icon: CalendarClock },
    { label: 'Orientación', value: mockData.orientacion, icon: Compass },
    { label: 'Piso', value: property.address.number?.split(' ').find(p => !isNaN(parseInt(p))) || 'No especificado', icon: Layers },
    { label: 'Tipo de Piso', value: mockData.tipoPiso, icon: Palette },
    { label: 'Ventanas', value: mockData.tipoVentanas, icon: WindowIcon },
    { label: 'Cocina', value: mockData.tipoCocina, icon: ChefHat },
    { label: 'Logia', value: mockData.logia ? 'Incluida' : 'No incluida', icon: WashingMachine },
    { label: 'Walk-in Closet', value: mockData.walkInCloset ? 'Sí' : 'No', icon: Shirt },
    { label: 'Calefacción', value: mockData.calefaccion, icon: Heater },
    { label: 'Aire Acondicionado', value: mockData.aireAcondicionado ? 'Sí' : 'No', icon: Snowflake },
  ];

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('piscina')) return Waves;
    if (lowerAmenity.includes('bodega')) return Archive;
    if (lowerAmenity.includes('gimnasio') || lowerAmenity.includes('gym')) return Dumbbell;
    if (lowerAmenity.includes('seguridad') || lowerAmenity.includes('conserje')) return ShieldCheck;
    if (lowerAmenity.includes('bicicletero')) return Bike;
    if (lowerAmenity.includes('ascensor')) return ArrowUpDown;
    if (lowerAmenity.includes('área verde') || lowerAmenity.includes('jardin')) return Trees;
    if (lowerAmenity.includes('estacionamiento')) return ParkingCircle;
    if (lowerAmenity.includes('pet-friendly') || lowerAmenity.includes('mascota')) return PawPrint;
    if (lowerAmenity.includes('sala de evento') || lowerAmenity.includes('quincho')) return PartyPopper;
    if (lowerAmenity.includes('terraza')) return Sun; // Or View
    if (lowerAmenity.includes('acceso controlado')) return KeyRound;
    if (lowerAmenity.includes('juego infantil')) return Puzzle;
    if (lowerAmenity.includes('lavandería')) return WashingMachine;
    if (lowerAmenity.includes('sala multiuso') || lowerAmenity.includes('cowork')) return Users;
    if (lowerAmenity.includes('spa') || lowerAmenity.includes('sauna')) return ThermometerSun;
    if (lowerAmenity.includes('cine')) return Tv;
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
    if (lowerAmenity.includes('amoblado')) return Sofa;
    if (lowerAmenity.includes('aire acondicionado')) return AirVent;
    if (lowerAmenity.includes('calefacción')) return Heater;
    if (lowerAmenity.includes('vista') || lowerAmenity.includes('panorámica')) return View;
    return CheckCircle; // Default icon
  };

  const fabIcon = () => {
    const icons = [Bot, Lightbulb, MessageCircleQuestion];
    return icons[currentFabMessageIndex % icons.length];
  };
  const CurrentFabIcon = fabIcon();


  return (
    <>
      <div className="max-w-6xl mx-auto py-8 pb-28 md:pb-10">
        {/* Breadcrumbs Section */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-1.5 text-sm text-muted-foreground">
            <li><Link href="/properties" className="hover:text-primary">Propiedades</Link></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li><Link href={`/properties?commune=${encodeURIComponent(property.address.commune)}`} className="hover:text-primary">{property.address.commune}</Link></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li><span className="hover:text-primary cursor-pointer" onClick={() => router.push(`/properties?search=${encodeURIComponent(property.condominioName)}`)}>{property.condominioName}</span></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li><span className="font-medium text-foreground">{derivedTypology}</span></li>
          </ol>
        </nav>
        

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/Main Column (Gallery, Details) - Col span 2 on LG */}
          <div className="lg:col-span-2 space-y-8">
            
            <section> {/* Section for Title, Favorite, and then Gallery */}
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
                <Button variant="ghost" size="icon" onClick={toggleFavorite} title="Guardar Favorito">
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </Button>
              </div>

              {/* Multimedia Gallery Section - MOVED HERE */}
              {property.imageUrls && property.imageUrls.length > 0 && (
                <div className="relative group mt-4"> {/* Added mt-4 for spacing from title */}
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={currentImageUrl}
                      alt={`${property.title} - imagen ${currentImageIndex + 1}`}
                      fill
                      style={{objectFit:"cover"}}
                      priority
                      data-ai-hint="apartment interior stylish"
                      className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                  </AspectRatio>
                  {property.imageUrls.length > 1 && (
                    <>
                      <Button onClick={prevImage} variant="outline" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none shadow-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button onClick={nextImage} variant="outline" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none shadow-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md shadow">
                    {currentImageIndex + 1} / {property.imageUrls.length}
                  </div>
                </div>
              )}
              <div className="mt-4 flex gap-2 flex-wrap">
                {property.virtualTourUrl && (
                  <Button variant="outline" asChild className="transition-all hover:shadow-md">
                    <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                      <Film className="mr-2 h-4 w-4" /> Tour Virtual 360°
                    </a>
                  </Button>
                )}
                <Button variant="outline" disabled className="transition-all hover:shadow-md">
                  <MapIcon className="mr-2 h-4 w-4" /> Ver Plano(s) (Próximamente)
                </Button>
              </div>
            </section>

            <section> {/* Section for Address, Key Specs, Unit Highlights */}
              <div className="flex items-center text-muted-foreground mb-3">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                {property.address.street}{property.address.number ? `, ${property.address.number}` : ''}, {property.address.commune}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                <span className="flex items-center"><BedDouble className="w-4 h-4 mr-1.5 text-primary" /> {property.bedrooms} Dormitorios</span>
                <span className="flex items-center"><Bath className="w-4 h-4 mr-1.5 text-primary" /> {property.bathrooms} Baños</span>
                <span className="flex items-center"><Square className="w-4 h-4 mr-1.5 text-primary" /> {property.areaSqMeters} m² Totales</span>
                {hasParking && <span className="flex items-center"><ParkingCircle className="w-4 h-4 mr-1.5 text-primary" /> Estacionamiento</span>}
                {hasBodega && <span className="flex items-center"><Archive className="w-4 h-4 mr-1.5 text-primary" /> Bodega</span>}
              </div>
              {unitHighlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {unitHighlights.map(highlight => (
                    <Badge key={highlight.label} variant="outline" className="border-sky-500 text-sky-700 bg-sky-100 dark:bg-sky-800/30 dark:text-sky-300 dark:border-sky-600 shadow-sm transition-all hover:shadow-md">
                      <highlight.icon className="mr-1.5 h-4 w-4 text-sky-600 dark:text-sky-400" />
                      {highlight.label}
                    </Badge>
                  ))}
                </div>
              )}
            </section>
            
            {/* Buttons for other units/typologies */}
            <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" size="sm" disabled className="transition-all hover:shadow-sm w-full">
                    <Repeat className="mr-2 h-4 w-4" /> Ver otras unidades {derivedTypology} en {property.condominioName} (Próximamente)
                </Button>
                <Button variant="outline" size="sm" disabled className="transition-all hover:shadow-sm w-full">
                    <Layers className="mr-2 h-4 w-4" /> Ver otras tipologías en {property.condominioName} (Próximamente)
                </Button>
            </div>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-3">Acerca de esta Propiedad</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{property.description}</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">Características Principales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-muted-foreground">
                {mainCharacteristics.map((char) => (
                  (char.label === 'Aire Acondicionado' && !mockData.aireAcondicionado && !char.value.toLowerCase().includes('sí') && !char.value.toLowerCase().includes('incluida')) ? null : ( 
                  <div key={char.label} className="flex items-start">
                    <char.icon className="w-5 h-5 mr-2.5 mt-0.5 text-primary shrink-0" />
                    <span><strong>{char.label}:</strong> {char.value}</span>
                  </div>
                  )
                ))}
              </div>
            </section>

            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Amenidades del Proyecto / Edificio</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                    {property.amenities.map((amenity, index) => {
                      const AmenityIcon = getAmenityIcon(amenity);
                      return (
                        <div key={index} className="flex items-center text-muted-foreground">
                          <AmenityIcon className="w-5 h-5 mr-2 text-primary shrink-0" />
                          {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            <Separator />
            <section>
              <h2 className="text-2xl font-semibold mb-4">Información Adicional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-muted-foreground">
                <div className="flex items-start"><PawPrint className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span><strong>Política de Mascotas:</strong> {mockData.politicaMascotas}</span></div>
                <div className="flex items-start"><CalendarDays className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" /> <span><strong>Disponibilidad:</strong> {mockData.disponibilidad}</span></div>
              </div>
            </section>

            <Separator />
            <section>
              <h2 className="text-2xl font-semibold mb-3">Ubicación y Entorno</h2>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md flex items-center justify-center">
                    <Image src="https://placehold.co/800x450.png?text=Mapa+Interactivo+Placeholder" alt="Mapa Placeholder" data-ai-hint="map location city" fill style={{objectFit:"cover"}} className="rounded-md opacity-70 transition-opacity duration-300 hover:opacity-100" />
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
                  <span className="flex items-center"><Trees className="w-4 h-4 mr-1.5 text-primary"/> Parque de las Esculturas</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">El barrio de {property.address.commune} es conocido por su excelente conectividad, seguridad y vibrante vida urbana, con acceso a parques, ciclovías y una amplia oferta gastronómica y cultural.</p>
              </div>
            </section>

            <Separator />
            <section>
              <h2 className="text-2xl font-semibold mb-3">Costos y Requisitos Para Arrendar</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-xl">Resumen de Costos Iniciales</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-muted-foreground">
                    <p className="flex items-start"><Wallet className="inline w-4 h-4 mr-1.5 text-primary mt-0.5 shrink-0" /> Mes de arriendo: {formatPrice(property.price, property.currency)}</p>
                    <p className="flex items-start"><Wallet className="inline w-4 h-4 mr-1.5 text-primary mt-0.5 shrink-0" /> Mes de garantía: {formatPrice(property.price, property.currency)} (1 mes)</p>
                    <p className="flex items-start"><Wallet className="inline w-4 h-4 mr-1.5 text-primary mt-0.5 shrink-0" /> Comisión: {mockData.comisionArrendatario}</p>
                    <p className="flex items-start"><Wallet className="inline w-4 h-4 mr-1.5 text-primary mt-0.5 shrink-0" /> Gastos notariales: Aprox. $25.000 CLP (Referencial)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xl">Requisitos Principales</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-muted-foreground">
                    {mockData.requisitos.map((req, i) => (
                      <p key={i} className="flex items-start"><FileText className="inline w-4 h-4 mr-1.5 text-primary mt-0.5 shrink-0" /> {req}</p>
                    ))}
                    <p className="text-xs mt-2">*Pueden aplicar otros requisitos o variaciones según evaluación.</p>
                  </CardContent>
                </Card>
              </div>
            </section>
             {/* First Payment Calculator Section */}
            <Separator className="my-8" />
            <section>
                <FirstPaymentCalculator monthlyRent={property.price} currency={property.currency} />
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
                  className="w-full text-lg py-6 transition-all hover:shadow-lg active:scale-95"
                  onClick={handleScheduleVisit}
                  disabled={property.status !== 'disponible'}
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  {property.status === 'disponible' ? 'Agendar Visita' : 'No Disponible'}
                </Button>
                {property.status !== 'disponible' && (
                  <p className="text-center text-sm text-destructive mt-2">Esta propiedad no se encuentra disponible.</p>
                )}
                <Button variant="outline" size="lg" className="w-full transition-all hover:shadow-md" disabled>
                  <Users className="mr-2 h-5 w-5" /> Contactar (Próximamente)
                </Button>
                <Separator />
                <div className="text-center">
                  <p className="text-sm font-medium">Publicado por Hommie.cl Agente</p>
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100 shadow-sm">
                      <ShieldCheck className="mr-1.5 h-4 w-4 text-green-600 dark:text-green-100"/> Propiedad Verificada
                  </Badge>
                </div>
                <div className="flex justify-center space-x-2 mt-2">
                    <Button variant="outline" size="icon" title="Compartir" disabled className="transition-all hover:shadow-sm"><Share2 className="h-5 w-5"/></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {property && (
        <VisitRequestDialog
            open={isVisitDialogOpen}
            onOpenChange={setIsVisitDialogOpen}
            propertyId={property.propertyId}
            propertyTitle={displayTitle}
        />
      )}

      {/* AI Chat FAB and Sheet */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="lg" 
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 h-14 rounded-full shadow-lg z-[60] flex items-center space-x-2 pr-5 group transition-all duration-300 ease-in-out hover:scale-105" 
            aria-label="Abrir chat de IA"
          >
            <CurrentFabIcon className="h-6 w-6 transition-transform duration-300 ease-in-out group-hover:rotate-12" />
            <span className="text-sm font-medium transition-all duration-300 ease-in-out opacity-100 max-w-[180px] truncate">
                {motivationalMessages[currentFabMessageIndex]}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full md:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Asistente de Arriendos IA</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-4.5rem)]"> {/* Ensure AIChatClient can fill this */}
            <AIChatClient initialContextMessage={`Tengo una consulta sobre la propiedad: "${property.title}" (ID: ${property.propertyId}) ubicada en ${property.address.commune}.`} />
          </div>
        </SheetContent>
      </Sheet>


      {/* Fixed Bottom Bar - Only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background p-3 md:p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t z-50 md:hidden">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold truncate" title={displayTitle}>
              {displayTitle}
            </h3>
            <p className="text-md sm:text-lg font-bold text-primary">
              {formatPrice(property.price, property.currency)}
              <span className="text-xs text-muted-foreground"> / Mes</span>
            </p>
          </div>
          <Button
            size="default"
            className="ml-2 sm:ml-4 whitespace-nowrap px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition-all active:scale-95"
            onClick={handleScheduleVisit}
            disabled={property.status !== 'disponible'}
          >
            <CalendarDays className="mr-0 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">
              {property.status === 'disponible' ? 'Agendar Visita' : 'No Disponible'}
            </span>
             <span className="sm:hidden">
              {property.status === 'disponible' ? 'Agendar' : 'No Disp.'}
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}

    
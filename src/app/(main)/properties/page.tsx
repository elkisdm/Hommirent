
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types';
import { getProperties } from '@/lib/firebase/firestore';
import { Search, Home, BedDouble, Sparkles, Gift, Star, PlayCircle, Square, ChevronRight, Briefcase, MapPin, Layers } from 'lucide-react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Mock data for now, replace with Firestore fetching
const mockProperties: Property[] = [
  {
    propertyId: `prop-condo1-tip1-1`,
    ownerUid: `owner-1`,
    title: `Unidad 101 Elegante`, // Simplified title for row display
    condominioName: 'Las Torres de Vitacura',
    description: 'Acogedora unidad en primer piso, ideal para parejas, con terminaciones de lujo.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 500000, currency: 'CLP', bedrooms: 2, bathrooms: 1, areaSqMeters: 60,
    amenities: ['estacionamiento', 'bodega', 'conserjeria', 'piscina', 'gimnasio equipado', 'salon gourmet'],
    imageUrls: [`https://placehold.co/800x600.png?text=Torres+2D1B+A`, `https://placehold.co/600x400.png?text=Torres+Living+A`, `https://placehold.co/600x400.png?text=Torres+Piscina`, `https://placehold.co/600x400.png?text=Torres+Gimnasio`],
    mainImageUrl: `https://placehold.co/800x600.png?text=Torres+2D1B+A`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo1-tip1-2`,
    ownerUid: `owner-2`,
    title: `Estudio Moderno 201`,
    condominioName: 'Las Torres de Vitacura',
    description: 'Luminosa unidad con vista despejada. Moderno Estudio, perfecto para profesionales jovenes.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 380000, currency: 'CLP', bedrooms: 0, bathrooms: 1, areaSqMeters: 35,
    amenities: ['estacionamiento', 'balcon', 'piscina temperada', 'seguridad 24/7'],
    imageUrls: [`https://placehold.co/800x600.png?text=Torres+Estudio+B`, `https://placehold.co/600x400.png?text=Torres+Cocina+B`],
    mainImageUrl: `https://placehold.co/800x600.png?text=Torres+Estudio+B`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo1-tip2-1`,
    ownerUid: `owner-3`,
    title: `Departamento Familiar 305`,
    condominioName: 'Las Torres de Vitacura',
    description: 'Amplia unidad familiar con terraza panorámica y excelente distribución interior.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 650000, currency: 'CLP', bedrooms: 3, bathrooms: 2, areaSqMeters: 85,
    amenities: ['estacionamiento', 'bodega', 'piscina', 'terraza', 'gimnasio', 'sala de juegos'],
    imageUrls: [`https://placehold.co/800x600.png?text=Torres+3D2B+C`, `https://placehold.co/600x400.png?text=Torres+Dormitorio+C`],
    mainImageUrl: `https://placehold.co/800x600.png?text=Torres+3D2B+C`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo2-tip1-1`,
    ownerUid: `owner-4`,
    title: `Loft Urbano 50A`,
    condominioName: 'Central Park Residences',
    description: 'Moderno Loft perfecto para profesionales, con acceso a metro y servicios.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 450000, currency: 'CLP', bedrooms: 1, bathrooms: 1, areaSqMeters: 50,
    amenities: ['gimnasio', 'sala multiuso', 'lavanderia', 'quincho con vista', 'cowork'],
    imageUrls: [`https://placehold.co/800x600.png?text=Central+Loft+D`, `https://placehold.co/600x400.png?text=Central+Gym+D`, `https://placehold.co/600x400.png?text=Central+Quincho`],
    mainImageUrl: `https://placehold.co/800x600.png?text=Central+Loft+D`,
    status: 'arrendado', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo2-tip2-1`,
    ownerUid: `owner-5`,
    title: `Departamento Ejecutivo 80C`,
    condominioName: 'Central Park Residences',
    description: 'Departamento con excelente distribución y luz natural, ideal para ejecutivos.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 580000, currency: 'CLP', bedrooms: 2, bathrooms: 2, areaSqMeters: 70,
    amenities: ['estacionamiento', 'gimnasio', 'piscina', 'quincho', 'seguridad', 'sala de cine'],
    imageUrls: [`https://placehold.co/800x600.png?text=Central+2D2B+E`, `https://placehold.co/600x400.png?text=Central+Piscina+E`],
    mainImageUrl: `https://placehold.co/800x600.png?text=Central+2D2B+E`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
   {
    propertyId: `prop-condo3-tip4-1`,
    ownerUid: `owner-6`,
    title: `Casa Familiar Grande con Jardín`,
    condominioName: 'Valle Escondido Lo Curro',
    description: 'Espaciosa casa en Las Condes con gran jardín privado y piscina, seguridad y tranquilidad.',
    address: { street: `Valle Escondido 700`, commune: 'Las Condes', city: 'Santiago', region: 'Metropolitana' },
    price: 1200000, currency: 'CLP', bedrooms: 4, bathrooms: 3, areaSqMeters: 220,
    amenities: ['estacionamiento x2', 'jardin amplio', 'piscina privada', 'seguridad 24hrs', 'club house'],
    imageUrls: [`https://placehold.co/800x600.png?text=Valle+4D3B+F`, `https://placehold.co/600x400.png?text=Valle+Jardin+F`],
    mainImageUrl: `https://placehold.co/800x600.png?text=Valle+4D3B+F`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
];

interface TypologyGroup {
  typologyKey: string;
  typologyName: string; // Abbreviated name for display e.g., "2D - 1B"
  units: Property[];
}

interface Promotion {
  text: string;
  icon?: React.ElementType;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

interface CondominioGroup {
  condominioName: string;
  typologies: TypologyGroup[];
  condominioImageUrls: string[];
  condominioAmenities: string[];
  condominioPromotions: Promotion[];
  address?: Property['address'];
}

const santiagoMetropolitanCommunes: string[] = [
  "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
  "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana",
  "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú",
  "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura",
  "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura",
  "Puente Alto", "Pirque", "San José de Maipo",
  "San Bernardo", "Buin", "Calera de Tango", "Paine",
  "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro",
  "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor",
  "Colina", "Lampa", "Tiltil"
].sort();


export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [groupedProperties, setGroupedProperties] = useState<CondominioGroup[]>([]);
  const [loading, setLoading] = useState(true); // For main list
  const [searchTerm, setSearchTerm] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState('');
  const [bedroomsFilter, setBedroomsFilter] = useState('');

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const getTypologyKey = (property: Property): string => `${property.bedrooms}D-${property.bathrooms}B`;

  const getAbbreviatedTypologyLabel = (bedrooms: number, bathrooms: number): string => {
    const bedLabel = bedrooms === 0 ? "Estudio" : (bedrooms === 1 ? `${bedrooms} Dorm.` : `${bedrooms} Dorms.`);
    const bathLabel = bathrooms === 1 ? `${bathrooms} Baño` : `${bathrooms} Baños`;
    return `${bedLabel} - ${bathLabel}`;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: currency }).format(price);
  };


  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setLoadingFeatured(true);
      try {
        // Simulating API call for all properties (status 'disponible')
        // const mainProps = await getProperties({ status: 'disponible' });
        const mainProps = mockProperties.filter(p => p.status === 'disponible');
        setAllProperties(mainProps);

        // Simulating API call for featured properties (e.g., limit 3, or based on some criteria)
        // const featured = await getProperties({ status: 'disponible', count: 3 });
        const featured = mockProperties.filter(p => p.status === 'disponible' && p.price > 500000).slice(0, 3);
        setFeaturedProperties(featured.length > 0 ? featured : mainProps.slice(0,3)); // Fallback if no "expensive" featured

      } catch (error) {
        console.error("Error fetching properties: ", error);
        // TODO: Add user-facing error handling (e.g., toast notification)
      } finally {
        setLoading(false);
        setLoadingFeatured(false);
      }
    };

    fetchInitialData();
  }, []);


  useEffect(() => {
    let filtered = allProperties;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.commune.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.condominioName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (communeFilter) {
      filtered = filtered.filter(p => p.address.commune === communeFilter);
    }

    if (bedroomsFilter) {
      if (bedroomsFilter === "0") {
        filtered = filtered.filter(p => p.bedrooms === 0);
      } else if (bedroomsFilter === "4+") {
        filtered = filtered.filter(p => p.bedrooms >= 4);
      } else if (bedroomsFilter === "loft") { 
        filtered = filtered.filter(p => p.bedrooms === 1 && (p.title.toLowerCase().includes('loft') || p.description.toLowerCase().includes('loft')));
      } else {
        const numBedrooms = parseInt(bedroomsFilter);
        if (!isNaN(numBedrooms)) {
          filtered = filtered.filter(p => p.bedrooms === numBedrooms);
        }
      }
    }

    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      if (priceRangeFilter.endsWith('-')) { // Handles "2000000-"
          if (!isNaN(min)) filtered = filtered.filter(p => p.price >= min);
      } else if (!isNaN(min) && !isNaN(max)) {
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      } else if (!isNaN(min)) { // Should not happen if ranges are well defined
        filtered = filtered.filter(p => p.price >= min);
      }
    }

    const condominiosMap = new Map<string, Map<string, Property[]>>();
    const condominioDetailsMap = new Map<string, { images: Set<string>, amenities: Set<string>, address?: Property['address']}>();

    filtered.forEach(property => {
      if (!condominiosMap.has(property.condominioName)) {
        condominiosMap.set(property.condominioName, new Map<string, Property[]>());
        condominioDetailsMap.set(property.condominioName, { images: new Set(), amenities: new Set(), address: property.address });
      }

      const details = condominioDetailsMap.get(property.condominioName)!;
      if (property.mainImageUrl) details.images.add(property.mainImageUrl);
      // Only add a few more unique images to avoid too many thumbnails
      for (let i=0; i < property.imageUrls.length && details.images.size < 4; i++) {
         details.images.add(property.imageUrls[i]);
      }
      property.amenities.forEach(am => details.amenities.add(am));


      const typologyMap = condominiosMap.get(property.condominioName)!;
      const typologyKey = getTypologyKey(property);
      if (!typologyMap.has(typologyKey)) {
        typologyMap.set(typologyKey, []);
      }
      typologyMap.get(typologyKey)!.push(property);
    });

    const grouped: CondominioGroup[] = [];
    condominiosMap.forEach((typologyMap, condominioName) => {
      const typologies: TypologyGroup[] = [];
      typologyMap.forEach((units, typologyKey) => {
        if (units.length > 0) {
          typologies.push({
            typologyKey,
            typologyName: getAbbreviatedTypologyLabel(units[0].bedrooms, units[0].bathrooms),
            units: units.sort((a,b) => a.price - b.price),
          });
        }
      });

      if (typologies.length > 0) {
        const condoDetails = condominioDetailsMap.get(condominioName)!;
        const uniqueImageUrls = Array.from(condoDetails.images);

        grouped.push({
          condominioName,
          address: condoDetails.address,
          typologies: typologies.sort((a,b) => {
            const getSortValue = (typKey: string) => {
              const parts = typKey.split('D-');
              const beds = parseInt(parts[0]);
              return isNaN(beds) ? (typKey.startsWith("Estudio") ? -1 : 99) : beds;
            };
            return getSortValue(a.typologyKey) - getSortValue(b.typologyKey);
          }),
          condominioImageUrls: uniqueImageUrls.length > 0 ? uniqueImageUrls : [`https://placehold.co/800x600.png?text=${encodeURIComponent(condominioName)}`],
          condominioAmenities: Array.from(condoDetails.amenities).slice(0, 5), // Show up to 5 amenities
          condominioPromotions: condominioName.toLowerCase().includes("park") || condominioName.toLowerCase().includes("residences")
            ? [{ text: "1er Mes con Descuento", icon: Gift, variant: "default" }, {text: "GGCC gratis x 3 meses", icon: Star, variant: "secondary"}]
            : (condominioName.toLowerCase().includes("torres") ? [{text: "Tour virtual disponible", icon: PlayCircle, variant: "outline"}] : []),
        });
      }
    });
    setGroupedProperties(grouped.sort((a,b) => a.condominioName.localeCompare(b.condominioName)));

  }, [searchTerm, communeFilter, priceRangeFilter, bedroomsFilter, allProperties]);


  if (loading && loadingFeatured && groupedProperties.length === 0 && featuredProperties.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-heading-foreground flex items-center justify-center">
          <Briefcase className="mr-3 h-10 w-10 text-primary" />
          Encuentra tu Próximo Hogar en Hommie.cl AI
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Explora nuestra cuidada selección de propiedades y descubre el lugar perfecto para ti, con la ayuda de nuestra IA.
        </p>
      </div>

      {loadingFeatured ? (
         <div className="text-center py-8"><Spinner size="medium" /></div>
      ) : featuredProperties.length > 0 ? (
        <section className="pb-4">
          <h2 className="text-3xl font-semibold tracking-tight mb-6 text-heading-foreground">Propiedades Destacadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.propertyId} property={prop} />
            ))}
          </div>
        </section>
      ) : (
        !loading && <p className="text-center text-muted-foreground py-6">No hay propiedades destacadas en este momento.</p>
      )}
      
      <Separator className="my-8" />

      <section>
        <h2 className="text-3xl font-semibold tracking-tight mb-6 text-heading-foreground">Busca y Filtra Propiedades</h2>
        <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-border/30 sticky top-[calc(var(--header-height,64px)+1rem)] z-40"> {/* Adjust top based on header height */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1 lg:col-span-2">
              <label htmlFor="search" className="text-sm font-medium text-muted-foreground">Palabra Clave</label>
              <Input
                  id="search"
                  placeholder="Proyecto, comuna, características..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-input/70"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="commune" className="text-sm font-medium text-muted-foreground">Comuna</label>
              <Select value={communeFilter} onValueChange={setCommuneFilter}>
                <SelectTrigger id="commune" className="bg-input/70">
                  <SelectValue placeholder="Todas las comunas" />
                </SelectTrigger>
                <SelectContent>
                  
                  {santiagoMetropolitanCommunes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="bedrooms" className="text-sm font-medium text-muted-foreground">Tipología</label>
              <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                <SelectTrigger id="bedrooms" className="bg-input/70">
                  <SelectValue placeholder="Cualquier tipología" />
                </SelectTrigger>
                <SelectContent>
                  
                  <SelectItem value="0">Estudio</SelectItem>
                  <SelectItem value="1">1 Dormitorio</SelectItem>
                  <SelectItem value="2">2 Dormitorios</SelectItem>
                  <SelectItem value="3">3 Dormitorios</SelectItem>
                  <SelectItem value="4+">4+ Dormitorios</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-1">
              <label htmlFor="priceRange" className="text-sm font-medium text-muted-foreground">Rango de Precio</label>
              <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                <SelectTrigger id="priceRange" className="bg-input/70">
                  <SelectValue placeholder="Cualquier rango" />
                </SelectTrigger>
                <SelectContent>
                  
                  <SelectItem value="0-500000">$0 - $500.000</SelectItem>
                  <SelectItem value="500000-800000">$500.000 - $800.000</SelectItem>
                  <SelectItem value="800000-1200000">$800.000 - $1.200.000</SelectItem>
                  <SelectItem value="1200000-2000000">$1.200.000 - $2.000.000</SelectItem>
                  <SelectItem value="2000000-">+ $2.000.000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 
            <Button
              className="w-full lg:w-auto text-base py-3 h-auto"
              onClick={() => {}}
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" /> Aplicar Filtros
            </Button>
            */}
          </div>
        </div>
      </section>

      {loading && !loadingFeatured ? <div className="flex justify-center py-12"><Spinner size="large" /></div> : null}

      {!loading && groupedProperties.length === 0 && !loadingFeatured && (
        <p className="text-center text-muted-foreground py-10 text-lg">No se encontraron propiedades con los criterios seleccionados.</p>
      )}

      {!loading && groupedProperties.length > 0 && (
        <div className="space-y-8 mt-10">
          {groupedProperties.map((condominio) => (
            <Card key={condominio.condominioName} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl border border-border/40">
              <CardHeader className="p-0 md:p-0">
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full lg:w-2/5 flex-shrink-0">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none overflow-hidden">
                      <Image
                        src={condominio.condominioImageUrls[0]}
                        alt={`Fachada de ${condominio.condominioName}`}
                        fill
                        style={{objectFit:"cover"}}
                        data-ai-hint="modern apartment building"
                        priority
                        className="transition-transform duration-500 ease-in-out hover:scale-105"
                      />
                    </AspectRatio>
                  </div>
                  <div className="w-full lg:w-3/5 p-5 md:p-6 space-y-3">
                    <CardTitle className="text-2xl md:text-3xl font-bold text-heading-foreground flex items-start">
                      <Home className="mr-3 mt-1 h-7 w-7 text-primary flex-shrink-0" />
                      <span>{condominio.condominioName}</span>
                    </CardTitle>
                    {condominio.address && (
                        <CardDescription className="text-sm md:text-base text-muted-foreground flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-primary/80 flex-shrink-0" />
                            {condominio.address.street}{condominio.address.number ? `, ${condominio.address.number}` : ''} - {condominio.address.commune}
                        </CardDescription>
                    )}
                    {condominio.condominioAmenities && condominio.condominioAmenities.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold mb-2 text-foreground/90">Comodidades Clave</h4>
                        <div className="flex flex-wrap gap-2">
                          {condominio.condominioAmenities.map((amenity, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="border-primary/50 text-primary/90 bg-primary/10 hover:bg-primary/20 shadow-sm text-xs"
                            >
                              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                              {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {condominio.condominioPromotions && condominio.condominioPromotions.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold mb-2 text-foreground/90">Beneficios Exclusivos</h4>
                        <div className="flex flex-wrap gap-2">
                          {condominio.condominioPromotions.map((promo, idx) => (
                            <Badge key={idx} variant={promo.variant || "default"} className="shadow-sm text-xs">
                              {promo.icon && React.createElement(promo.icon, {className: "mr-1.5 h-3.5 w-3.5"})}
                              {promo.text}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                 {condominio.condominioImageUrls.length > 1 && (
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-0.5 px-0.5 pb-0.5 lg:px-1 lg:pb-1 lg:gap-1 bg-card">
                        {condominio.condominioImageUrls.slice(1, Math.min(4, condominio.condominioImageUrls.length)).map((url, idx) => (
                        <div key={idx} className="relative group">
                             <AspectRatio ratio={16/9} className="bg-muted overflow-hidden rounded-md">
                                <Image
                                    src={url}
                                    alt={`Thumbnail ${idx + 1} de ${condominio.condominioName}`}
                                    fill
                                    style={{objectFit:"cover"}}
                                    data-ai-hint="apartment interior luxury"
                                    className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                                />
                             </AspectRatio>
                        </div>
                        ))}
                    </div>
                )}
              </CardHeader>
              <CardContent className="p-0 bg-background/90 rounded-b-xl">
                <Accordion type="multiple" className="w-full">
                  {condominio.typologies.map((typology) => (
                    <AccordionItem value={typology.typologyKey} key={typology.typologyKey} className="border-b border-border/20 last:border-b-0">
                      <AccordionTrigger className="text-lg font-medium hover:no-underline bg-muted/20 hover:bg-muted/30 dark:bg-muted/10 dark:hover:bg-muted/20 px-5 py-4 data-[state=open]:bg-muted/30 data-[state=open]:dark:bg-muted/20 transition-colors duration-150 ease-in-out rounded-none data-[state=open]:border-b data-[state=open]:border-primary/30">
                        <div className="flex items-center w-full justify-between">
                            <div className="flex items-center">
                              <Layers className="mr-3 h-5 w-5 text-primary" />
                              <span className="text-primary">{typology.typologyName}</span>
                            </div>
                            <span className="text-sm text-muted-foreground ml-3">({typology.units.length} unidad{typology.units.length !== 1 ? 'es' : ''} disponible{typology.units.length !== 1 ? 's' : ''})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-0 bg-background/95 data-[state=open]:border-b data-[state=open]:border-border/10">
                        <div className="divide-y divide-border/10">
                          {typology.units.map((unit) => (
                            <div key={unit.propertyId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 hover:bg-muted/10 dark:hover:bg-muted/5 transition-colors duration-150 ease-in-out">
                              <div className="flex-1 min-w-0 pr-3 mb-3 sm:mb-0">
                                <Link href={`/properties/${unit.propertyId}`} className="hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded-sm group">
                                  <h4 className="text-md font-semibold text-foreground group-hover:text-primary transition-colors">{unit.title}</h4>
                                </Link>
                                <p className="text-lg text-primary font-medium mt-1">{formatPrice(unit.price, unit.currency)}</p>
                                <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1.5">
                                  <span><BedDouble className="inline h-3.5 w-3.5 mr-1 text-muted-foreground/80" />{unit.bedrooms}D</span>
                                  <span><Square className="inline h-3.5 w-3.5 mr-1 text-muted-foreground/80" />{unit.areaSqMeters} m²</span>
                                  {unit.status === 'disponible' ? (
                                    <Badge variant="outline" className="text-xs py-0.5 px-2 h-auto border-green-600 text-green-700 bg-green-500/15 dark:border-green-500 dark:text-green-400 dark:bg-green-500/20">Disponible</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs py-0.5 px-2 h-auto bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/50">{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="default"
                                className="ml-auto sm:ml-4 shrink-0 text-primary hover:bg-primary/10 hover:text-primary border-primary/70 hover:border-primary px-6 py-2.5"
                              >
                                <Link href={`/properties/${unit.propertyId}`}>
                                  Ver Unidad <ChevronRight className="h-4 w-4 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


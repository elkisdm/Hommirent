
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as React from 'react'; // Added React import
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { Search, Home, BedDouble, Sparkles, Gift, Star, PlayCircle } from 'lucide-react'; 

// Mock data for now, replace with Firestore fetching
const mockProperties: Property[] = [
  {
    propertyId: `prop-condo1-tip1-1`,
    ownerUid: `owner-1`,
    title: `Unidad 101 - 2D1B`,
    condominioName: 'Las Torres',
    description: 'Acogedora unidad en primer piso, ideal para parejas.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 500000, currency: 'CLP', bedrooms: 2, bathrooms: 1, areaSqMeters: 60,
    amenities: ['estacionamiento', 'bodega', 'conserjeria', 'piscina', 'gimnasio'],
    imageUrls: [`https://placehold.co/600x400.png?text=Torres+2D1B+A`, `https://placehold.co/600x400.png?text=Torres+Living+A`, `https://placehold.co/600x400.png?text=Torres+Piscina`, `https://placehold.co/600x400.png?text=Torres+Gimnasio`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Torres+2D1B+A`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo1-tip1-2`,
    ownerUid: `owner-2`,
    title: `Unidad 201 - 2D1B`,
    condominioName: 'Las Torres',
    description: 'Luminosa unidad con vista despejada.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 520000, currency: 'CLP', bedrooms: 2, bathrooms: 1, areaSqMeters: 62,
    amenities: ['estacionamiento', 'balcon', 'piscina'],
    imageUrls: [`https://placehold.co/600x400.png?text=Torres+2D1B+B`, `https://placehold.co/600x400.png?text=Torres+Cocina+B`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Torres+2D1B+B`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo1-tip2-1`,
    ownerUid: `owner-3`,
    title: `Unidad 305 - 3D2B`,
    condominioName: 'Las Torres',
    description: 'Amplia unidad familiar con terraza.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 650000, currency: 'CLP', bedrooms: 3, bathrooms: 2, areaSqMeters: 85,
    amenities: ['estacionamiento', 'bodega', 'piscina', 'terraza', 'gimnasio'],
    imageUrls: [`https://placehold.co/600x400.png?text=Torres+3D2B+C`, `https://placehold.co/600x400.png?text=Torres+Dormitorio+C`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Torres+3D2B+C`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo2-tip1-1`,
    ownerUid: `owner-4`,
    title: `Depto. 50A - 1D1B`,
    condominioName: 'Central Park',
    description: 'Moderno estudio perfecto para profesionales.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 400000, currency: 'CLP', bedrooms: 1, bathrooms: 1, areaSqMeters: 40,
    amenities: ['gimnasio', 'sala multiuso', 'lavanderia', 'quincho'],
    imageUrls: [`https://placehold.co/600x400.png?text=Central+1D1B+D`, `https://placehold.co/600x400.png?text=Central+Gym+D`, `https://placehold.co/600x400.png?text=Central+Quincho`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Central+1D1B+D`,
    status: 'arrendado', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo2-tip2-1`,
    ownerUid: `owner-5`,
    title: `Depto. 80C - 2D2B`,
    condominioName: 'Central Park',
    description: 'Departamento con excelente distribución y luz natural.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 580000, currency: 'CLP', bedrooms: 2, bathrooms: 2, areaSqMeters: 70,
    amenities: ['estacionamiento', 'gimnasio', 'piscina', 'quincho', 'seguridad'],
    imageUrls: [`https://placehold.co/600x400.png?text=Central+2D2B+E`, `https://placehold.co/600x400.png?text=Central+Piscina+E`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Central+2D2B+E`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
];

interface TypologyGroup {
  typologyKey: string; // e.g., "2D-1B"
  typologyName: string; // e.g., "2 Dormitorios, 1 Baño"
  units: Property[];
}

interface Promotion {
  text: string;
  icon?: React.ElementType; // Lucide icon component
}

interface CondominioGroup {
  condominioName: string;
  typologies: TypologyGroup[];
  condominioImageUrls: string[];
  condominioVideoUrl?: string;
  condominioAmenities: string[];
  condominioPromotions: Promotion[];
  address?: Property['address']; 
}


export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [groupedProperties, setGroupedProperties] = useState<CondominioGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState(''); 
  const [bedroomsFilter, setBedroomsFilter] = useState('');

  const getTypologyKey = (property: Property): string => `${property.bedrooms}D-${property.bathrooms}B`;
  const getTypologyName = (property: Property): string => `${property.bedrooms} Dormitorio${property.bedrooms !== 1 ? 's' : ''}, ${property.bathrooms} Baño${property.bathrooms !== 1 ? 's' : ''}`;


  useEffect(() => {
    const fetchAndProcessProperties = async () => {
      setLoading(true);
      try {
        // Simulating fetching ALL properties, then filtering client-side
        // In a real app, some filtering might happen server-side if possible
        // const propertiesCollection = collection(db, 'properties');
        // const q = query(propertiesCollection, where('status', '==', 'disponible'));
        // const querySnapshot = await getDocs(q);
        // const fetchedProps = querySnapshot.docs.map(doc => ({ propertyId: doc.id, ...doc.data() } as Property));
        const fetchedProps = mockProperties.filter(p => p.status === 'disponible'); 
        setAllProperties(fetchedProps);
      } catch (error) {
        console.error("Error fetching properties: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessProperties();
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
      filtered = filtered.filter(p => p.bedrooms === parseInt(bedroomsFilter));
    }
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      } else if (!isNaN(min)) {
        filtered = filtered.filter(p => p.price >= min);
      } else if (!isNaN(max)) {
        filtered = filtered.filter(p => p.price <= max);
      }
    }

    const condominiosMap = new Map<string, Map<string, Property[]>>();
    // Store additional details per condominio (images, amenities, address)
    const condominioDetailsMap = new Map<string, { images: Set<string>, amenities: Set<string>, address?: Property['address']}>();

    filtered.forEach(property => {
      if (!condominiosMap.has(property.condominioName)) {
        condominiosMap.set(property.condominioName, new Map<string, Property[]>());
        // Initialize details for the new condominio
        condominioDetailsMap.set(property.condominioName, { images: new Set(), amenities: new Set(), address: property.address });
      }
      
      // Aggregate images and amenities from each unit for the condominio view
      const details = condominioDetailsMap.get(property.condominioName)!;
      // Add mainImageUrl first, then other images, limit to avoid too many
      details.images.add(property.mainImageUrl);
      property.imageUrls.forEach(img => details.images.add(img));
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
            typologyName: getTypologyName(units[0]),
            units: units.sort((a,b) => a.price - b.price), // Sort units by price within typology
          });
        }
      });

      if (typologies.length > 0) {
        const condoDetails = condominioDetailsMap.get(condominioName)!;
        // Take up to 4 unique images for the mosaic (1 main, 3 thumbs)
        const uniqueImageUrls = Array.from(condoDetails.images).slice(0, 4); 
        
        grouped.push({
          condominioName,
          address: condoDetails.address, // Store the address of the first unit as condo address
          typologies: typologies.sort((a,b) => a.typologyName.localeCompare(b.typologyName)), // Sort typologies by name
          condominioImageUrls: uniqueImageUrls.length > 0 ? uniqueImageUrls : [`https://placehold.co/600x400.png?text=${encodeURIComponent(condominioName)}`],
          condominioVideoUrl: condominioName.toLowerCase().includes("torres") ? 'https://www.youtube.com/embed/LXb3EKWsInQ' : undefined, // Sample video for one
          condominioAmenities: Array.from(condoDetails.amenities).slice(0, 6), // Show up to 6 unique amenities
          condominioPromotions: condominioName.toLowerCase().includes("park") 
            ? [{ text: "Primer mes 50% OFF", icon: Gift }, {text: "GGCC gratis x 3 meses", icon: Star}] 
            : (condominioName.toLowerCase().includes("torres") ? [{text: "Tour virtual disponible", icon: PlayCircle}] : []),
        });
      }
    });
    
    // Sort condominios by name
    setGroupedProperties(grouped.sort((a,b) => a.condominioName.localeCompare(b.condominioName)));

  }, [searchTerm, communeFilter, priceRangeFilter, bedroomsFilter, allProperties]);

  const communes = [...new Set(allProperties.map(p => p.address.commune))].sort();
  const priceRanges = [
    { label: 'Hasta $500.000', value: '0-500000'},
    { label: '$500.001 - $800.000', value: '500001-800000'},
    { label: 'Desde $800.001', value: '800001-999999999'},
  ];

  if (loading && groupedProperties.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Encuentra tu Próximo Hogar</h1>
        <p className="mt-2 text-lg text-muted-foreground">Explora las unidades disponibles en nuestros proyectos.</p>
      </div>

      {/* Filters Section */}
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1 lg:col-span-2">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <Input 
                id="search"
                placeholder="Proyecto, comuna, características..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="commune" className="text-sm font-medium">Comuna</label>
            <Select value={communeFilter} onValueChange={setCommuneFilter}>
              <SelectTrigger id="commune">
                <SelectValue placeholder="Todas las comunas" />
              </SelectTrigger>
              <SelectContent>
                {communes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="bedrooms" className="text-sm font-medium">Dormitorios</label>
            <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
              <SelectTrigger id="bedrooms">
                <SelectValue placeholder="Cualquier número" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} dorm.</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           {/* <div className="space-y-1">
            <label htmlFor="priceRange" className="text-sm font-medium">Rango de Precio</label>
            <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
              <SelectTrigger id="priceRange">
                <SelectValue placeholder="Cualquier precio" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div> */}
          <Button 
            className="w-full md:w-auto" 
            onClick={() => { /* Logic to apply filters can be triggered here explicitly if needed, though useEffect handles it */}}
          >
            <Search className="mr-2 h-4 w-4" /> Aplicar Filtros
          </Button>
        </div>
      </div>

      {/* Properties Listing */}
      {loading && <div className="flex justify-center py-8"><Spinner /></div>}
      
      {!loading && groupedProperties.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No se encontraron propiedades con los criterios seleccionados.</p>
      )}

      {!loading && groupedProperties.length > 0 && (
        <div className="space-y-6">
          {groupedProperties.map((condominio) => (
            <Card key={condominio.condominioName} className="overflow-hidden shadow-lg rounded-xl">
              <CardHeader className="p-4 md:p-6 bg-muted/30">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  {/* Image Mosaic & Video Section */}
                  <div className="w-full lg:w-2/5 space-y-2 flex-shrink-0">
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                      <Image 
                        src={condominio.condominioImageUrls[0]} 
                        alt={`Imagen principal de ${condominio.condominioName}`} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint="apartment building exterior"
                        priority
                        className="hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {condominio.condominioImageUrls.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {condominio.condominioImageUrls.slice(1, Math.min(4, condominio.condominioImageUrls.length)).map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-md overflow-hidden shadow">
                            <Image 
                              src={url} 
                              alt={`Thumbnail ${idx + 1} de ${condominio.condominioName}`} 
                              layout="fill" 
                              objectFit="cover" 
                              data-ai-hint="building facade detail"
                              className="hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {condominio.condominioVideoUrl && (
                      <div className="relative aspect-video rounded-lg overflow-hidden mt-2 shadow-md">
                        <iframe
                          width="100%"
                          height="100%"
                          src={condominio.condominioVideoUrl}
                          title={`Video de ${condominio.condominioName}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full border-0"
                        ></iframe>
                      </div>
                    )}
                  </div>

                  {/* Info, Amenities & Promotions */}
                  <div className="w-full lg:w-3/5 space-y-3 mt-2 lg:mt-0">
                    <CardTitle className="text-2xl md:text-3xl flex items-center font-bold">
                      <Home className="mr-3 h-7 w-7 text-primary" />
                      {condominio.condominioName}
                    </CardTitle>
                    {condominio.address && (
                        <CardDescription className="text-sm md:text-base text-muted-foreground">
                            {condominio.address.street}{condominio.address.number ? `, ${condominio.address.number}` : ''}, {condominio.address.commune}, {condominio.address.city}
                        </CardDescription>
                    )}
                    

                    {condominio.condominioAmenities && condominio.condominioAmenities.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground tracking-wider uppercase">Comodidades Destacadas del Proyecto</h4>
                        <div className="flex flex-wrap gap-2">
                          {condominio.condominioAmenities.map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="border-teal-500 text-teal-700 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700 shadow-sm">
                              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-teal-500" />
                              {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {condominio.condominioPromotions && condominio.condominioPromotions.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground tracking-wider uppercase">Promociones Vigentes</h4>
                        <div className="flex flex-wrap gap-2">
                          {condominio.condominioPromotions.map((promo, idx) => (
                            <Badge key={idx} variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm">
                              {promo.icon && React.createElement(promo.icon, {className: "mr-1.5 h-3.5 w-3.5"})}
                              {promo.text}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-2 md:pt-4">
                <Accordion type="multiple" className="w-full">
                  {condominio.typologies.map((typology) => (
                    <AccordionItem value={typology.typologyKey} key={typology.typologyKey} className="border-b-0 mb-2 last:mb-0">
                      <AccordionTrigger className="text-lg hover:no-underline bg-slate-50 hover:bg-slate-100 px-4 py-3 rounded-md shadow-sm data-[state=open]:rounded-b-none data-[state=open]:bg-slate-100">
                        <div className="flex items-center">
                           <BedDouble className="mr-2 h-5 w-5 text-primary" /> Tipología: {typology.typologyName} ({typology.units.length} unidad{typology.units.length !== 1 ? 'es' : ''})
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-2 px-2 bg-slate-50 rounded-b-md shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                          {typology.units.map((unit) => (
                            <PropertyCard key={unit.propertyId} property={unit} />
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


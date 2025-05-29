
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types';
// import { db } from '@/lib/firebase/config'; // Firestore imports commented out for mock data
// import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { Search, Home, BedDouble, Sparkles, Gift, Star, PlayCircle, Square, ChevronRight } from 'lucide-react'; 
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore'; // Keep for mock data type consistency

// Mock data for now, replace with Firestore fetching
const mockProperties: Property[] = [
  {
    propertyId: `prop-condo1-tip1-1`,
    ownerUid: `owner-1`,
    title: `Unidad 101`, // Simplified title for row display
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
    title: `Unidad 201`,
    condominioName: 'Las Torres',
    description: 'Luminosa unidad con vista despejada. Moderno Estudio.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 380000, currency: 'CLP', bedrooms: 0, bathrooms: 1, areaSqMeters: 35,
    amenities: ['estacionamiento', 'balcon', 'piscina'],
    imageUrls: [`https://placehold.co/600x400.png?text=Torres+Estudio+B`, `https://placehold.co/600x400.png?text=Torres+Cocina+B`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Torres+Estudio+B`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo1-tip2-1`,
    ownerUid: `owner-3`,
    title: `Unidad 305`,
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
    title: `Depto. 50A`,
    condominioName: 'Central Park',
    description: 'Moderno Loft perfecto para profesionales.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 450000, currency: 'CLP', bedrooms: 1, bathrooms: 1, areaSqMeters: 50,
    amenities: ['gimnasio', 'sala multiuso', 'lavanderia', 'quincho'],
    imageUrls: [`https://placehold.co/600x400.png?text=Central+Loft+D`, `https://placehold.co/600x400.png?text=Central+Gym+D`, `https://placehold.co/600x400.png?text=Central+Quincho`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Central+Loft+D`,
    status: 'arrendado', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo2-tip2-1`,
    ownerUid: `owner-5`,
    title: `Depto. 80C`,
    condominioName: 'Central Park',
    description: 'Departamento con excelente distribución y luz natural.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 580000, currency: 'CLP', bedrooms: 2, bathrooms: 2, areaSqMeters: 70,
    amenities: ['estacionamiento', 'gimnasio', 'piscina', 'quincho', 'seguridad'],
    imageUrls: [`https://placehold.co/600x400.png?text=Central+2D2B+E`, `https://placehold.co/600x400.png?text=Central+Piscina+E`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Central+2D2B+E`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
   {
    propertyId: `prop-condo3-tip4-1`,
    ownerUid: `owner-6`,
    title: `Casa Familiar Grande`,
    condominioName: 'Valle Escondido',
    description: 'Espaciosa casa en Las Condes con gran jardín.',
    address: { street: `Valle Escondido 700`, commune: 'Las Condes', city: 'Santiago', region: 'Metropolitana' },
    price: 1200000, currency: 'CLP', bedrooms: 4, bathrooms: 3, areaSqMeters: 220,
    amenities: ['estacionamiento', 'jardin', 'piscina', 'seguridad'],
    imageUrls: [`https://placehold.co/600x400.png?text=Valle+4D3B+F`, `https://placehold.co/600x400.png?text=Valle+Jardin+F`], 
    mainImageUrl: `https://placehold.co/600x400.png?text=Valle+4D3B+F`,
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState(''); 
  const [bedroomsFilter, setBedroomsFilter] = useState('');

  const getTypologyKey = (property: Property): string => `${property.bedrooms}D-${property.bathrooms}B`;
  
  const getAbbreviatedTypologyLabel = (bedrooms: number, bathrooms: number): string => {
    const bedLabel = bedrooms === 0 ? "Estudio" : `${bedrooms}D`;
    const bathLabel = `${bathrooms}B`;
    return `${bedLabel} - ${bathLabel}`;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: currency }).format(price);
  };


  useEffect(() => {
    const fetchAndProcessProperties = async () => {
      setLoading(true);
      try {
        // Simulate fetching: Replace with actual Firestore call when ready
        // const propertiesRef = collection(db, 'properties');
        // const q = query(propertiesRef, where('status', '==', 'disponible'), limit(50)); // Example query
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
      if (bedroomsFilter === "0") { // Estudio
        filtered = filtered.filter(p => p.bedrooms === 0);
      } else if (bedroomsFilter === "4+") { // 4+ Dormitorios
        filtered = filtered.filter(p => p.bedrooms >= 4);
      } else if (bedroomsFilter === "loft") { // Loft (approximated as 1 bedroom for now)
        filtered = filtered.filter(p => p.bedrooms === 1); 
      } else {
        const numBedrooms = parseInt(bedroomsFilter);
        if (!isNaN(numBedrooms)) {
          filtered = filtered.filter(p => p.bedrooms === numBedrooms);
        }
      }
    }

    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      } else if (!isNaN(min)) { // Only min is defined (e.g., "Desde X")
        filtered = filtered.filter(p => p.price >= min);
      } else if (!isNaN(max)) { // Only max is defined (e.g., "Hasta X")
        filtered = filtered.filter(p => p.price <= max);
      }
    }

    // Group properties by condominioName and then by typology
    const condominiosMap = new Map<string, Map<string, Property[]>>();
    const condominioDetailsMap = new Map<string, { images: Set<string>, amenities: Set<string>, address?: Property['address']}>();

    filtered.forEach(property => {
      if (!condominiosMap.has(property.condominioName)) {
        condominiosMap.set(property.condominioName, new Map<string, Property[]>());
        condominioDetailsMap.set(property.condominioName, { images: new Set(), amenities: new Set(), address: property.address });
      }
      
      const details = condominioDetailsMap.get(property.condominioName)!;
      // Prioritize mainImageUrl for the project's primary display image
      if (property.mainImageUrl) details.images.add(property.mainImageUrl);
      // Then add other images, ensuring no duplicates and limiting total
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
            typologyName: getAbbreviatedTypologyLabel(units[0].bedrooms, units[0].bathrooms),
            units: units.sort((a,b) => a.price - b.price), // Sort units by price within typology
          });
        }
      });

      if (typologies.length > 0) {
        const condoDetails = condominioDetailsMap.get(condominioName)!;
        const uniqueImageUrls = Array.from(condoDetails.images).slice(0, 4); // Max 4 images for gallery
        
        grouped.push({
          condominioName,
          address: condoDetails.address, 
          typologies: typologies.sort((a,b) => { // Sort typologies (Estudio first, then by beds)
            const getSortValue = (typKey: string) => {
              const parts = typKey.split('D-');
              const beds = parseInt(parts[0]);
              return isNaN(beds) ? (typKey.startsWith("Estudio") ? -1 : 99) : beds;
            };
            return getSortValue(a.typologyKey) - getSortValue(b.typologyKey);
          }),
          condominioImageUrls: uniqueImageUrls.length > 0 ? uniqueImageUrls : [`https://placehold.co/600x400.png?text=${encodeURIComponent(condominioName)}`],
          // Example video URL
          condominioVideoUrl: condominioName.toLowerCase().includes("torres") ? 'https://www.youtube.com/embed/LXb3EKWsInQ' : undefined, 
          condominioAmenities: Array.from(condoDetails.amenities).slice(0, 6), // Max 6 amenities
          // Example promotions
          condominioPromotions: condominioName.toLowerCase().includes("park") 
            ? [{ text: "Primer mes 50% OFF", icon: Gift }, {text: "GGCC gratis x 3 meses", icon: Star}] 
            : (condominioName.toLowerCase().includes("torres") ? [{text: "Tour virtual disponible", icon: PlayCircle}] : []),
        });
      }
    });
    
    // Sort condominio groups by name
    setGroupedProperties(grouped.sort((a,b) => a.condominioName.localeCompare(b.condominioName)));

  }, [searchTerm, communeFilter, priceRangeFilter, bedroomsFilter, allProperties]);

  const priceRanges = [
    { label: 'Hasta $500.000', value: '0-500000'},
    { label: '$500.001 - $800.000', value: '500001-800000'},
    { label: 'Desde $800.001', value: '800001-999999999'}, // Using a large number for "max"
  ];

  if (loading && groupedProperties.length === 0) { // Initial loading state
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-heading-foreground">Encuentra tu Próximo Hogar</h1>
        <p className="mt-2 text-lg text-muted-foreground">Explora las unidades disponibles en nuestros proyectos.</p>
      </div>

      {/* Filters Section */}
      <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-border/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1 lg:col-span-2">
            <label htmlFor="search" className="text-sm font-medium text-muted-foreground">Buscar</label>
            <Input 
                id="search"
                placeholder="Proyecto, comuna, características..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="commune" className="text-sm font-medium text-muted-foreground">Comuna</label>
            <Select value={communeFilter} onValueChange={setCommuneFilter}>
              <SelectTrigger id="commune">
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
              <SelectTrigger id="bedrooms">
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
          {/* Apply Filters button - could trigger manual re-filter if not auto-filtering on change */}
          <Button 
            className="w-full md:w-auto" 
            onClick={() => { /* Logic to explicitly apply filters if needed, or can be removed if filtering is auto */ }}
          >
            <Search className="mr-2 h-4 w-4" /> Aplicar Filtros
          </Button>
        </div>
      </div>

      {/* Properties Listing */}
      {loading && <div className="flex justify-center py-8"><Spinner /></div>} {/* Spinner for subsequent filtering loads */}
      
      {!loading && groupedProperties.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No se encontraron propiedades con los criterios seleccionados.</p>
      )}

      {!loading && groupedProperties.length > 0 && (
        <div className="space-y-6">
          {groupedProperties.map((condominio) => (
            <Card key={condominio.condominioName} className="overflow-hidden shadow-lg rounded-xl border border-border/40">
              {/* Condominio Header */}
              <CardHeader className="p-4 md:p-6 bg-card/60">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  {/* Image Gallery Column */}
                  <div className="w-full lg:w-2/5 space-y-2 flex-shrink-0">
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-md group">
                      <Image 
                        src={condominio.condominioImageUrls[0]} 
                        alt={`Imagen principal de ${condominio.condominioName}`} 
                        fill
                        style={{objectFit:"cover"}}
                        data-ai-hint="apartment building exterior"
                        priority
                        className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-75 group-hover:opacity-50 transition-opacity"></div>
                    </div>
                    {condominio.condominioImageUrls.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {condominio.condominioImageUrls.slice(1, Math.min(4, condominio.condominioImageUrls.length)).map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-md overflow-hidden shadow group">
                            <Image 
                              src={url} 
                              alt={`Thumbnail ${idx + 1} de ${condominio.condominioName}`} 
                              fill
                              style={{objectFit:"cover"}}
                              data-ai-hint="building facade detail"
                              className="transition-transform duration-300 ease-in-out group-hover:scale-105"
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

                  {/* Condominio Info Column */}
                  <div className="w-full lg:w-3/5 space-y-3 mt-2 lg:mt-0">
                    <CardTitle className="text-2xl md:text-3xl flex items-center font-bold text-heading-foreground">
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
                        <h4 className="text-sm font-semibold mb-2 text-foreground/80">Comodidades Destacadas del Proyecto</h4>
                        <div className="flex flex-wrap gap-2">
                          {condominio.condominioAmenities.map((amenity, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="border-teal-600 text-teal-600 bg-teal-500/10 hover:bg-teal-500/20 dark:border-teal-500 dark:text-teal-400 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 shadow-sm"
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
                        <h4 className="text-sm font-semibold mb-2 text-foreground/80">Promociones Vigentes</h4>
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
              <CardContent className="p-0 bg-background/90"> {/* Changed padding and background */}
                <Accordion type="multiple" className="w-full">
                  {condominio.typologies.map((typology) => (
                    <AccordionItem value={typology.typologyKey} key={typology.typologyKey} className="border-b border-border/20 last:border-b-0">
                      <AccordionTrigger className="text-md font-medium hover:no-underline bg-muted/10 hover:bg-muted/20 dark:bg-muted/5 dark:hover:bg-muted/10 px-4 py-3 data-[state=open]:bg-muted/20 data-[state=open]:dark:bg-muted/10 transition-colors duration-150 ease-in-out data-[state=open]:rounded-b-none">
                        <div className="flex items-center w-full justify-between">
                            <div className="flex items-center">
                            <BedDouble className="mr-2.5 h-5 w-5 text-primary" />
                            <span className="text-primary">{typology.typologyName}</span>
                            <span className="text-xs text-muted-foreground ml-2">({typology.units.length} unidad{typology.units.length !== 1 ? 'es' : ''})</span>
                            </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-0 bg-background/95"> {/* Adjusted background */}
                        <div className="divide-y divide-border/20">
                          {typology.units.map((unit) => (
                            <div key={unit.propertyId} className="flex items-center justify-between py-4 px-4 hover:bg-muted/5 dark:hover:bg-muted/3 transition-colors duration-150 ease-in-out">
                              <div className="flex-1 min-w-0 pr-3"> {/* Added flex-1 and min-w-0 for better spanning */}
                                <Link href={`/properties/${unit.propertyId}`} className="hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded-sm group">
                                  <h4 className="text-md font-semibold text-foreground group-hover:text-primary transition-colors">{unit.title}</h4>
                                </Link>
                                <p className="text-sm text-primary font-medium mt-0.5">{formatPrice(unit.price, unit.currency)}</p>
                                <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                                  <span><Square className="inline h-3 w-3 mr-1 text-muted-foreground/80" />{unit.areaSqMeters} m²</span>
                                  {unit.status === 'disponible' ? (
                                    <Badge variant="outline" className="text-xs py-0 px-1.5 h-5 border-green-600 text-green-700 bg-green-500/15 dark:border-green-500 dark:text-green-400 dark:bg-green-500/20">Disponible</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs py-0 px-1.5 h-5 bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/50">{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</Badge>
                                  )}
                                </div>
                              </div>
                              <Button 
                                asChild 
                                variant="ghost" 
                                size="sm" 
                                className="ml-4 shrink-0 text-primary hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-md"
                              >
                                <Link href={`/properties/${unit.propertyId}`}>
                                  Ver Unidad <ChevronRight className="h-4 w-4 ml-1.5" />
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


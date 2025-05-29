'use client';

import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Property } from '@/types';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { Search, Filter, Home, BedDouble } from 'lucide-react';

// Mock data for now, replace with Firestore fetching
const mockProperties: Property[] = [
  {
    propertyId: `prop-condo1-tip1-1`,
    ownerUid: `owner-1`,
    title: `Unidad 101 - 2D1B`,
    condominioName: 'Condominio Las Torres',
    description: 'Acogedora unidad en primer piso, ideal para parejas.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 500000, currency: 'CLP', bedrooms: 2, bathrooms: 1, areaSqMeters: 60,
    amenities: ['estacionamiento', 'bodega'],
    imageUrls: [`https://placehold.co/600x400.png?text=Torres+2D1B+1`], mainImageUrl: `https://placehold.co/600x400.png?text=Torres+2D1B+1`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo1-tip1-2`,
    ownerUid: `owner-2`,
    title: `Unidad 201 - 2D1B`,
    condominioName: 'Condominio Las Torres',
    description: 'Luminosa unidad con vista despejada.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 520000, currency: 'CLP', bedrooms: 2, bathrooms: 1, areaSqMeters: 62,
    amenities: ['estacionamiento'],
    imageUrls: [`https://placehold.co/600x400.png?text=Torres+2D1B+2`], mainImageUrl: `https://placehold.co/600x400.png?text=Torres+2D1B+2`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo1-tip2-1`,
    ownerUid: `owner-3`,
    title: `Unidad 305 - 3D2B`,
    condominioName: 'Condominio Las Torres',
    description: 'Amplia unidad familiar con terraza.',
    address: { street: `Av. Los Leones 120`, commune: 'Providencia', city: 'Santiago', region: 'Metropolitana' },
    price: 650000, currency: 'CLP', bedrooms: 3, bathrooms: 2, areaSqMeters: 85,
    amenities: ['estacionamiento', 'bodega', 'piscina'],
    imageUrls: [`https://placehold.co/600x400.png?text=Torres+3D2B+1`], mainImageUrl: `https://placehold.co/600x400.png?text=Torres+3D2B+1`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo2-tip1-1`,
    ownerUid: `owner-4`,
    title: `Depto. 50A - 1D1B`,
    condominioName: 'Edificio Central Park',
    description: 'Moderno estudio perfecto para profesionales.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 400000, currency: 'CLP', bedrooms: 1, bathrooms: 1, areaSqMeters: 40,
    amenities: ['gimnasio', 'sala multiuso'],
    imageUrls: [`https://placehold.co/600x400.png?text=Central+1D1B+1`], mainImageUrl: `https://placehold.co/600x400.png?text=Central+1D1B+1`,
    status: 'arrendado', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
  {
    propertyId: `prop-condo2-tip2-1`,
    ownerUid: `owner-5`,
    title: `Depto. 80C - 2D2B`,
    condominioName: 'Edificio Central Park',
    description: 'Departamento con excelente distribución y luz natural.',
    address: { street: `Av. Libertador 300`, commune: 'Santiago Centro', city: 'Santiago', region: 'Metropolitana' },
    price: 580000, currency: 'CLP', bedrooms: 2, bathrooms: 2, areaSqMeters: 70,
    amenities: ['estacionamiento', 'gimnasio', 'piscina', 'quincho'],
    imageUrls: [`https://placehold.co/600x400.png?text=Central+2D2B+1`], mainImageUrl: `https://placehold.co/600x400.png?text=Central+2D2B+1`,
    status: 'disponible', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  },
];

interface TypologyGroup {
  typologyKey: string; // e.g., "2D-1B"
  typologyName: string; // e.g., "2 Dormitorios, 1 Baño"
  units: Property[];
}

interface CondominioGroup {
  condominioName: string;
  typologies: TypologyGroup[];
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
        // Simulate API call or Firestore fetch
        // For now, using mock data
        // const propertiesCol = collection(db, 'properties');
        // let q = query(propertiesCol, where('status', '==', 'disponible'), limit(20));
        // const querySnapshot = await getDocs(q);
        // const fetchedProps = querySnapshot.docs.map(doc => ({ propertyId: doc.id, ...doc.data() } as Property));
        const fetchedProps = mockProperties.filter(p => p.status === 'disponible'); // Start with available properties
        setAllProperties(fetchedProps); // Store all fetched (available) properties

      } catch (error) {
        console.error("Error fetching properties: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessProperties();
  }, []);


  useEffect(() => {
    // Apply filters
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
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    // Group filtered properties
    const condominiosMap = new Map<string, Map<string, Property[]>>();

    filtered.forEach(property => {
      if (!condominiosMap.has(property.condominioName)) {
        condominiosMap.set(property.condominioName, new Map<string, Property[]>());
      }
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
            typologyName: getTypologyName(units[0]), // Get name from first unit of this type
            units: units.sort((a,b) => a.price - b.price), // Sort units by price for example
          });
        }
      });
      if (typologies.length > 0) {
        grouped.push({
          condominioName,
          typologies: typologies.sort((a,b) => a.typologyName.localeCompare(b.typologyName)), // Sort typologies
        });
      }
    });
    
    setGroupedProperties(grouped.sort((a,b) => a.condominioName.localeCompare(b.condominioName))); // Sort condominios by name

  }, [searchTerm, communeFilter, priceRangeFilter, bedroomsFilter, allProperties]);


  // Get unique communes for filter dropdown
  const communes = [...new Set(allProperties.map(p => p.address.commune))].sort();


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
        <p className="mt-2 text-lg text-muted-foreground">Explora las unidades disponibles en nuestros condominios.</p>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <Input 
                id="search"
                placeholder="Condominio, comuna, palabra clave..." 
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
                {/* Item for "All communes" is handled by placeholder. Empty value string is not allowed for SelectItem. */}
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
                {/* Item for "Any number" is handled by placeholder. Empty value string is not allowed for SelectItem. */}
                {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} dorm.</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { /* Filters are applied via useEffect */ }} className="w-full md:w-auto">
            <Search className="mr-2 h-4 w-4" /> Aplicar Filtros
          </Button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-8"><Spinner /></div>}
      
      {!loading && groupedProperties.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No se encontraron propiedades con los criterios seleccionados.</p>
      )}

      {!loading && groupedProperties.length > 0 && (
        <div className="space-y-6">
          {groupedProperties.map((condominio) => (
            <Card key={condominio.condominioName} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Home className="mr-3 h-6 w-6 text-primary" />
                  {condominio.condominioName}
                </CardTitle>
                {/* You can add more condominio-level details here if available */}
                <CardDescription>
                  {/* Example: condominio.address.street ? `${condominio.address.street}, ${condominio.address.commune}` : '' */}
                  Unidades disponibles en {condominio.condominioName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {condominio.typologies.map((typology) => (
                    <AccordionItem value={typology.typologyKey} key={typology.typologyKey}>
                      <AccordionTrigger className="text-lg hover:no-underline">
                        <div className="flex items-center">
                           <BedDouble className="mr-2 h-5 w-5 text-primary" /> Tipología: {typology.typologyName} ({typology.units.length} unidad{typology.units.length !== 1 ? 'es' : ''})
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

'use client';

import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Property } from '@/types';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, Timestamp, limit } from 'firebase/firestore';
import { Search, Filter } from 'lucide-react';

// Mock data for now, replace with Firestore fetching
const mockProperties: Property[] = Array(6).fill(null).map((_, i) => ({
  propertyId: `prop-${i + 1}`,
  ownerUid: `owner-${i + 1}`,
  title: `Moderno Departamento en Providencia ${i + 1}`,
  description: 'Hermoso y amplio departamento con excelente ubicación, cercano a metro, parques y comercios. Ideal para familias o profesionales.',
  address: {
    street: `Av. Los Leones 12${i}`,
    number: `Depto ${i + 1}01`,
    commune: 'Providencia',
    city: 'Santiago',
    region: 'Metropolitana',
  },
  price: 500000 + i * 50000,
  currency: 'CLP',
  bedrooms: 2 + (i % 2),
  bathrooms: 1 + (i % 2),
  areaSqMeters: 60 + i * 5,
  amenities: ['piscina', 'estacionamiento', 'bodega', 'pet-friendly'].slice(0, 2 + (i % 3)),
  imageUrls: [`https://placehold.co/800x600.png?text=Propiedad+${i+1}`],
  mainImageUrl: `https://placehold.co/600x400.png?text=Propiedad+${i+1}`,
  status: 'disponible',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
}));


export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState(''); // e.g. "0-500000"
  const [bedroomsFilter, setBedroomsFilter] = useState('');


  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // Simulating API call
        // In a real app, you'd fetch from Firestore here based on filters
        // For now, just use mock data and apply basic client-side filtering for demo
        let filteredProperties = mockProperties;

        if (searchTerm) {
            filteredProperties = filteredProperties.filter(p => 
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.address.commune.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (communeFilter) {
            filteredProperties = filteredProperties.filter(p => p.address.commune === communeFilter);
        }
        if (bedroomsFilter) {
            filteredProperties = filteredProperties.filter(p => p.bedrooms === parseInt(bedroomsFilter));
        }
        if (priceRangeFilter) {
            const [min, max] = priceRangeFilter.split('-').map(Number);
            filteredProperties = filteredProperties.filter(p => p.price >= min && p.price <= max);
        }

        // const propertiesCol = collection(db, 'properties');
        // let q = query(propertiesCol, where('status', '==', 'disponible'), limit(20));
        // TODO: Add actual Firestore querying with filters.
        // const querySnapshot = await getDocs(q);
        // const propsData = querySnapshot.docs.map(doc => ({ propertyId: doc.id, ...doc.data() } as Property));
        
        setProperties(filteredProperties); // Use mock for now
      } catch (error) {
        console.error("Error fetching properties: ", error);
        // Handle error (e.g., show toast)
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchTerm, communeFilter, priceRangeFilter, bedroomsFilter]); // Re-fetch when filters change

  const handleSearch = () => {
      // Triggered by button, but useEffect handles filtering logic
      // This function could be used for more complex search logic if needed
  }

  // Get unique communes for filter dropdown (from mock data for now)
  const communes = [...new Set(mockProperties.map(p => p.address.commune))];


  if (loading && properties.length === 0) {
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
        <p className="mt-2 text-lg text-muted-foreground">Explora las propiedades disponibles en Hommie.cl AI.</p>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <Input 
                id="search"
                placeholder="Palabra clave, comuna..." 
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
                {/* <SelectItem value="">Todas las comunas</SelectItem> <- Removed */}
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
                {/* <SelectItem value="">Cualquier número</SelectItem> <- Removed */}
                {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} dorm.</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} className="w-full md:w-auto">
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-8"><Spinner /></div>}
      
      {!loading && properties.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No se encontraron propiedades con los criterios seleccionados.</p>
      )}

      {!loading && properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.propertyId} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

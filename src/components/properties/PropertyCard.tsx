
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Square, Tag } from 'lucide-react';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group hover:scale-[1.01]">
      <CardHeader className="p-0">
        <Link href={`/properties/${property.propertyId}`} className="block overflow-hidden">
          <div className="relative h-56 w-full">
            <Image
              src={property.mainImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(property.title)}`}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint="apartment building"
              className="transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/properties/${property.propertyId}`}>
          <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">{property.title}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">{property.description}</CardDescription>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 mr-1 text-primary" />
          {property.address.commune}, {property.address.city}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
          <div className="flex items-center">
            <BedDouble className="w-4 h-4 mr-1 text-primary" /> {property.bedrooms} dorm.
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1 text-primary" /> {property.bathrooms} baños
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1 text-primary" /> {property.areaSqMeters} m²
          </div>
        </div>
        <p className="text-xl font-semibold text-primary mb-2">{formatPrice(property.price)} <span className="text-xs text-muted-foreground">{property.currency}</span></p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full">
          <Link href={`/properties/${property.propertyId}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

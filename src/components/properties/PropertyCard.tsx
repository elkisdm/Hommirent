
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { MapPin, BedDouble, Bath, Square } from 'lucide-react';
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
      <Link href={`/properties/${property.propertyId}`} className="block group/link">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 10} className="bg-muted">
            <Image
              src={property.mainImageUrl || `https://placehold.co/600x375.png?text=${encodeURIComponent(property.title)}`}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint="apartment building modern"
              className="transition-transform duration-300 ease-in-out group-hover/link:scale-105"
            />
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg mb-1 group-hover/link:text-primary transition-colors">{property.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">{property.description}</CardDescription>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 mr-1.5 text-primary" />
            {property.address.commune}, {property.address.city}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3 text-muted-foreground">
            <div className="flex items-center">
              <BedDouble className="w-4 h-4 mr-1.5 text-primary" /> {property.bedrooms} dorm.
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1.5 text-primary" /> {property.bathrooms} baños
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1.5 text-primary" /> {property.areaSqMeters} m²
            </div>
          </div>
          <p className="text-xl font-bold text-primary mb-1">{formatPrice(property.price)}
            <span className="text-xs text-muted-foreground ml-1">{property.currency}</span>
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 border-t mt-auto">
        <Button asChild className="w-full">
          <Link href={`/properties/${property.propertyId}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

import type { Property } from '@/types';

export const getTypologyKey = (property: Property): string => `${property.bedrooms}D-${property.bathrooms}B`;

export const getAbbreviatedTypologyLabel = (bedrooms: number, bathrooms: number): string => {
  const bedLabel = bedrooms === 0 ? 'Estudio' : (bedrooms === 1 ? `${bedrooms} Dorm.` : `${bedrooms} Dorms.`);
  const bathLabel = bathrooms === 1 ? `${bathrooms} Baño` : `${bathrooms} Baños`;
  return `${bedLabel} - ${bathLabel}`;
};

export const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(price);
};

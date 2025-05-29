import type { Timestamp, GeoPoint } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'arrendatario' | 'propietario';
  displayName?: string;
  createdAt: Timestamp;
}

export interface Property {
  propertyId: string;
  ownerUid: string;
  title: string;
  description: string;
  address: {
    street: string;
    number?: string; // Optional as some properties might not have a number or it's part of street
    commune: string;
    city: string;
    region: string;
    coordinates?: GeoPoint; // Optional for MVP
  };
  price: number;
  currency: string; // Default "CLP"
  bedrooms: number;
  bathrooms: number;
  areaSqMeters: number;
  amenities: string[];
  imageUrls: string[];
  mainImageUrl: string;
  status: 'disponible' | 'arrendado' | 'en_revision'; // Default "disponible"
  virtualTourUrl?: string; // Optional
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Interest {
  interestId: string;
  propertyId: string;
  tenantUid: string;
  ownerUid: string;
  message?: string;
  status: 'pendiente' | 'contactado';
  createdAt: Timestamp;
}

export type UserRole = 'arrendatario' | 'propietario';

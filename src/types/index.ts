import type { Timestamp, GeoPoint } from 'firebase/firestore';

export type UserRole = 'arrendatario' | 'propietario' | 'superadmin'; // Added 'superadmin'

export interface UserProfile {
  uid: string;
  email: string | null;
  role: UserRole; // Updated to use the new UserRole type
  displayName?: string;
  createdAt: Timestamp;
}

export interface Property {
  propertyId: string;
  ownerUid: string;
  title: string;
  description: string;
  condominioName: string;
  address: {
    street: string;
    number?: string; 
    commune: string;
    city: string;
    region: string;
    coordinates?: GeoPoint;
  };
  price: number;
  currency: string; 
  bedrooms: number;
  bathrooms: number;
  areaSqMeters: number;
  amenities: string[];
  imageUrls: string[];
  mainImageUrl: string;
  status: 'disponible' | 'arrendado' | 'en_revision'; 
  virtualTourUrl?: string; 
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

export interface ScheduledVisit {
  visitId: string;
  propertyId: string;
  userUid: string;
  propertyTitle: string;
  date: Timestamp;
  time: string;
  createdAt: Timestamp;
}

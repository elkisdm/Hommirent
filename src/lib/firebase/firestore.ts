import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { Property } from '@/types';

const PROPERTIES_COLLECTION = 'properties';

// Create a new property
export const createProperty = async (propertyData: Omit<Property, 'propertyId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), {
    ...propertyData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get a single property by ID
export const getPropertyById = async (propertyId: string): Promise<Property | null> => {
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { propertyId: docSnap.id, ...docSnap.data() } as Property;
  }
  return null;
};

// Get all properties (with optional filters and limits)
// This is a basic example, more complex querying will be needed for full functionality
interface GetPropertiesParams {
  ownerUid?: string;
  status?: 'disponible' | 'arrendado' | 'en_revision';
  maxPrice?: number;
  minBedrooms?: number;
  commune?: string;
  count?: number;
}
export const getProperties = async (params: GetPropertiesParams = {}): Promise<Property[]> => {
  const qConstraints = [];
  if (params.ownerUid) qConstraints.push(where('ownerUid', '==', params.ownerUid));
  if (params.status) qConstraints.push(where('status', '==', params.status));
  if (params.maxPrice) qConstraints.push(where('price', '<=', params.maxPrice));
  if (params.minBedrooms) qConstraints.push(where('bedrooms', '>=', params.minBedrooms));
  if (params.commune) qConstraints.push(where('address.commune', '==', params.commune));
  
  qConstraints.push(orderBy('createdAt', 'desc'));
  if (params.count) qConstraints.push(limit(params.count));

  const q = query(collection(db, PROPERTIES_COLLECTION), ...qConstraints);
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ propertyId: doc.id, ...doc.data() } as Property));
};

// Update an existing property
export const updateProperty = async (propertyId: string, data: Partial<Property>): Promise<void> => {
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Delete a property
export const deleteProperty = async (propertyId: string): Promise<void> => {
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  await deleteDoc(docRef);
};

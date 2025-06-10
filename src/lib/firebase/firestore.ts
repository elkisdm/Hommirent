
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
  Timestamp, // Import Timestamp
  type GeoPoint
} from 'firebase/firestore';
import type { Property } from '@/types';

const PROPERTIES_COLLECTION = 'properties';

// --- START OF MOCK DATA ---
const mockProperties: Property[] = [
  {
    propertyId: "mock-prop-001",
    ownerUid: "mockOwnerProvidencia",
    title: "Elegante Depto. 2D2B en Providencia Central",
    condominioName: "Edificio Capital Providencia",
    description: "Espectacular departamento de 2 dormitorios y 2 baños, con acabados de lujo. Ubicación privilegiada cerca de metro, parques y restaurantes. Cocina integrada, amplia terraza con vista despejada. Edificio full amenities.",
    address: {
      street: "Av. Providencia",
      number: "1234, Depto 502",
      commune: "Providencia",
      city: "Santiago",
      region: "Metropolitana de Santiago",
      coordinates: null,
    },
    price: 850000,
    currency: "CLP",
    bedrooms: 2,
    bathrooms: 2,
    areaSqMeters: 75,
    amenities: ["piscina", "gimnasio", "estacionamiento", "bodega", "conserjeria", "sala_eventos", "ascensor"],
    imageUrls: [
      "https://placehold.co/800x600.png?text=Living+Luminoso+Mock1",
      "https://placehold.co/800x600.png?text=Dormitorio+Principal+Mock1",
      "https://placehold.co/800x600.png?text=Cocina+Moderna+Mock1",
      "https://placehold.co/800x600.png?text=Terraza+Vista+Mock1"
    ],
    mainImageUrl: "https://placehold.co/800x600.png?text=Living+Luminoso+Mock1",
    status: "disponible",
    virtualTourUrl: "https://my.matterport.com/show/?m=TEST123XYZ",
    createdAt: Timestamp.fromDate(new Date('2023-10-01T10:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2023-10-05T12:00:00Z')),
  },
  {
    propertyId: "mock-prop-002",
    ownerUid: "mockOwnerNunoa",
    title: "Casa Familiar 3D2B con Jardín en Ñuñoa",
    condominioName: "Casa Individual Ñuñoa Bonita",
    description: "Amplia casa de 3 dormitorios y 2 baños, perfecta para familias. Cuenta con un hermoso jardín trasero, quincho y estacionamiento para dos autos. Sector tranquilo y residencial, cercano a colegios y plazas.",
    address: {
      street: "Los Cerezos",
      number: "567",
      commune: "Ñuñoa",
      city: "Santiago",
      region: "Metropolitana de Santiago",
      coordinates: null,
    },
    price: 1200000,
    currency: "CLP",
    bedrooms: 3,
    bathrooms: 2,
    areaSqMeters: 140,
    amenities: ["estacionamiento", "bodega", "quincho", "pet-friendly", "jardin_privado"],
    imageUrls: [
      "https://placehold.co/800x600.png?text=Fachada+Casa+Mock2",
      "https://placehold.co/800x600.png?text=Jardin+Amplio+Mock2",
      "https://placehold.co/800x600.png?text=Living+Comedor+Casa+Mock2"
    ],
    mainImageUrl: "https://placehold.co/800x600.png?text=Fachada+Casa+Mock2",
    status: "disponible",
    createdAt: Timestamp.fromDate(new Date('2023-09-15T14:30:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2023-09-20T10:00:00Z')),
  },
  {
    propertyId: "mock-prop-003",
    ownerUid: "mockOwnerCentro",
    title: "Moderno Studio Amoblado Santiago Centro",
    condominioName: "Edificio Conecta Centro",
    description: "Práctico y moderno studio amoblado, ideal para estudiantes o profesionales jóvenes. Excelente conectividad, a pasos del metro. Cocina equipada, cama plegable, espacio de trabajo. Edificio con lavandería y cowork.",
    address: {
      street: "Huérfanos",
      number: "1050, Depto 1210",
      commune: "Santiago", // Santiago Centro
      city: "Santiago",
      region: "Metropolitana de Santiago",
      coordinates: null,
    },
    price: 450000,
    currency: "CLP",
    bedrooms: 0, // Studio
    bathrooms: 1,
    areaSqMeters: 30,
    amenities: ["conserjeria", "ascensor", "amoblado", "lavanderia", "cowork"],
    imageUrls: [
      "https://placehold.co/800x600.png?text=Studio+Interior+Mock3",
      "https://placehold.co/800x600.png?text=Kitchenette+Mock3"
    ],
    mainImageUrl: "https://placehold.co/800x600.png?text=Studio+Interior+Mock3",
    status: "arrendado",
    createdAt: Timestamp.fromDate(new Date('2023-11-01T09:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2023-11-02T17:00:00Z')),
  },
  {
    propertyId: "mock-prop-004",
    ownerUid: "mockOwnerVitacura",
    title: "Penthouse de Lujo con Vistas Panorámicas",
    condominioName: "Residencias Altavista",
    description: "Exclusivo penthouse de 3 dormitorios en suite, más servicios. Amplias terrazas con vistas panorámicas de la ciudad y la cordillera. Acabados de primer nivel, domótica, seguridad 24/7. Edificio con piscina, spa y accesos controlados.",
    address: {
      street: "Alonso de Córdova",
      number: "5300, Penthouse A",
      commune: "Vitacura",
      city: "Santiago",
      region: "Metropolitana de Santiago",
      coordinates: null,
    },
    price: 3500000,
    currency: "CLP",
    bedrooms: 3,
    bathrooms: 4,
    areaSqMeters: 220,
    amenities: ["piscina", "gimnasio", "estacionamiento", "bodega", "conserjeria", "ascensor", "spa", "pet-friendly", "terraza_panoramica", "seguridad_24h"],
    imageUrls: [
      "https://placehold.co/800x600.png?text=Penthouse+Living+Mock4",
      "https://placehold.co/800x600.png?text=Terraza+Gigante+Mock4",
      "https://placehold.co/800x600.png?text=Master+Suite+Mock4",
      "https://placehold.co/800x600.png?text=Vista+Ciudad+Mock4"
    ],
    mainImageUrl: "https://placehold.co/800x600.png?text=Penthouse+Living+Mock4",
    status: "en_revision",
    createdAt: Timestamp.fromDate(new Date('2023-12-01T11:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2023-12-01T11:00:00Z')),
  }
];
// --- END OF MOCK DATA ---

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
  // First, check mock data
  const mockProperty = mockProperties.find(p => p.propertyId === propertyId);
  if (mockProperty) {
    return { ...mockProperty }; // Return a copy to prevent accidental mutation
  }

  // If not in mock, fetch from Firestore
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { propertyId: docSnap.id, ...docSnap.data() } as Property;
  }
  return null;
};

// Get all properties (with optional filters and limits)
interface GetPropertiesParams {
  ownerUid?: string;
  status?: 'disponible' | 'arrendado' | 'en_revision';
  maxPrice?: number;
  minBedrooms?: number;
  commune?: string;
  count?: number;
}
export const getProperties = async (params: GetPropertiesParams = {}): Promise<Property[]> => {
  let combinedProperties: Property[] = [...mockProperties.map(p => ({...p}))]; // Start with copies of mock properties

  try {
    const qConstraints = [];
    // Note: Firestore queries are applied to Firestore data only before merging.
    // Complex filtering on combined data happens client-side or after fetching.
    if (params.ownerUid) qConstraints.push(where('ownerUid', '==', params.ownerUid));
    if (params.status) qConstraints.push(where('status', '==', params.status));
    if (params.maxPrice) qConstraints.push(where('price', '<=', params.maxPrice));
    if (params.minBedrooms && typeof params.minBedrooms === 'number') {
         qConstraints.push(where('bedrooms', '>=', params.minBedrooms));
    }
    if (params.commune) qConstraints.push(where('address.commune', '==', params.commune));
    
    qConstraints.push(orderBy('createdAt', 'desc'));
    // We fetch more from Firestore if a specific count is needed across combined data later
    // Or apply limit to Firestore query if count is very small. For now, fetch without Firestore limit.

    const q = query(collection(db, PROPERTIES_COLLECTION), ...qConstraints);
    const querySnapshot = await getDocs(q);
    const firestoreProperties = querySnapshot.docs.map(doc => ({ propertyId: doc.id, ...doc.data() } as Property));

    // Merge, ensuring mock properties aren't duplicated if they somehow got into Firestore with same IDs
    const firestorePropertyIds = new Set(firestoreProperties.map(p => p.propertyId));
    const uniqueMockProperties = mockProperties.filter(mp => !firestorePropertyIds.has(mp.propertyId));
    
    combinedProperties = [...uniqueMockProperties, ...firestoreProperties];
    
    // Sort all properties by createdAt after merging
    combinedProperties.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return dateB - dateA; // descending
    });


  } catch (error) {
    console.error("Error fetching properties from Firestore, returning only mock data:", error);
    // In case of error, we already have mockProperties in combinedProperties
    // We still sort them to be consistent
    combinedProperties.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return dateB - dateA; // descending
    });
  }
  
  // Apply filters to the combined list if they were provided
  let filteredCombined = combinedProperties;
  if (params.ownerUid) {
    filteredCombined = filteredCombined.filter(p => p.ownerUid === params.ownerUid);
  }
  if (params.status) {
    filteredCombined = filteredCombined.filter(p => p.status === params.status);
  }
   if (params.maxPrice) {
    filteredCombined = filteredCombined.filter(p => p.price <= params.maxPrice!);
  }
  if (params.minBedrooms && typeof params.minBedrooms === 'number') {
    filteredCombined = filteredCombined.filter(p => p.bedrooms >= params.minBedrooms!);
  }
  if (params.commune) {
    filteredCombined = filteredCombined.filter(p => p.address.commune === params.commune);
  }

  // Apply limit if provided
  if (params.count) {
    return filteredCombined.slice(0, params.count);
  }

  return filteredCombined;
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

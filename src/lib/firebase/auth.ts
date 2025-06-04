import { auth, db } from './config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  type UserCredential,
  type User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/types';

interface SignUpParams {
  email: string;
  password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory: string;
  role: 'arrendatario' | 'propietario'; // For public signup, superadmin is not an option
  displayName?: string;
}

// Note: The signUp function is for general user registration (arrendatario/propietario).
// Superadmin role assignment would typically be a manual process or via a secure internal tool.
export const signUp = async ({ email, password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory, role, displayName }: SignUpParams): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory);
  const user = userCredential.user;

  const userProfileData: UserProfile = {
    uid: user.uid,
    email: user.email,
    role, // Role from params
    displayName: displayName || user.email?.split('@')[0] || 'Usuario',
    createdAt: serverTimestamp() as any, 
  };
  await setDoc(doc(db, 'users', user.uid), userProfileData);
  
  return userCredential;
};

interface SignInParams {
  email: string;
  password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory: string;
}

export const signIn = async ({ email, password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory }: SignInParams): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory);
};

export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  return firebaseSendPasswordResetEmail(auth, email);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    // Explicitly cast to UserProfile to ensure role type is correct
    return userDocSnap.data() as UserProfile;
  }
  return null;
};

// Function to update user profile (example)
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

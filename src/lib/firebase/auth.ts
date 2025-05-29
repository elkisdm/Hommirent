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
  role: UserRole;
  displayName?: string;
}

export const signUp = async ({ email, password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory, role, displayName }: SignUpParams): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory);
  const user = userCredential.user;

  // Create user profile in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    role,
    displayName: displayName || user.email?.split('@')[0] || 'Usuario',
    createdAt: serverTimestamp() as any, // Firestore will convert this
  };
  await setDoc(doc(db, 'users', user.uid), userProfile);
  
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
    return userDocSnap.data() as UserProfile;
  }
  return null;
};

// Function to update user profile (example)
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

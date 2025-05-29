'use client';
import { useAuth as useAuthContextHook } from '@/contexts/AuthContext';

export const useAuth = () => {
  return useAuthContextHook();
};

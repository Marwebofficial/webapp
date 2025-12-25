'use client';

import React, { useMemo, type ReactNode, useContext } from 'react';
import FirebaseProvider, { FirebaseContext } from '@/firebase/provider';
import { initializeFirebase } from './initialize';
import { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}

export const useFirestore = (): Firestore => {
  const context = useContext(FirebaseContext);
  if (!context || !context.firestore) {
    throw new Error('useFirestore must be used within a FirebaseProvider and have a firestore instance');
  }
  return context.firestore;
};

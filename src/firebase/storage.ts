import { FirebaseStorage } from 'firebase/storage';
import { useFirebase } from './provider';

/** Hook to access Firebase Storage instance. */
export const useStorage = (): FirebaseStorage => {
  const { storage } = useFirebase();
  if (!storage) {
    throw new Error('Storage service not available. Check FirebaseProvider.');
  }
  return storage;
};

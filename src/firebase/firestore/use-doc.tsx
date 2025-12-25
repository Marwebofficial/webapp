'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { WithId } from './use-collection';

/** 
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * React hook to subscribe to a Firestore document in real-time.
 * Handles nullable references.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} targetRef - The Firestore DocumentReference.
 * Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, and error.
 */
export function useDoc<T = any>(
  targetRef: DocumentReference<DocumentData> | null | undefined
): UseDocResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const docPath = useMemo(() => targetRef?.path, [targetRef]);

  useEffect(() => {
    if (!targetRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      targetRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: targetRef.path,
          });
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        } else {
          setError(error);
        }
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docPath]); // Re-run only if the document path changes

  return { data, isLoading, error };
}

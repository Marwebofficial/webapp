
'use client';

import { useMemo, DependencyList } from 'react';

/**
 * A custom hook that memoizes a value, but only on the client side.
 * This is useful for preventing server-side execution of code that should only
 * run in the browser.
 *
 * @param factory The function to compute the value.
 * @param deps The dependency array for the useMemo hook.
 * @returns The memoized value.
 */

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

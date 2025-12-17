
import { useMemo, DependencyList } from 'react';

/**
 * A custom memoization hook for Firebase objects.
 *
 * This hook is a wrapper around `useMemo` that adds a `__memo` property to the
 * memoized value. This property is used by other hooks in this project to
 * ensure that Firebase objects are properly memoized.
 *
 * @param factory The function to memoize.
 * @param deps The dependency array for the `useMemo` hook.
 * @returns The memoized value.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps) as T & { __memo?: boolean };
  if (memoized) {
    memoized.__memo = true;
  }
  return memoized;
}

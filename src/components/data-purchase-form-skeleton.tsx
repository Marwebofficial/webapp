
import { Skeleton } from './ui/skeleton';

export function DataPurchaseFormSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto p-8 space-y-8 border rounded-lg shadow-lg bg-card">
      <div className="space-y-4 text-center">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
        </div>

         <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      <Skeleton className="h-12 w-full" />
    </div>
  );
}

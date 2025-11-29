import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CardSkeleton() {
  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <Skeleton className="h-6 w-32 bg-slate-800" />
        <Skeleton className="h-4 w-48 bg-slate-800" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full bg-slate-800" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-3 w-3/4 bg-slate-800" />
          </div>
          <Skeleton className="h-8 w-20 bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-slate-800" />
        <Skeleton className="h-10 w-full bg-slate-800" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-slate-800" />
        <Skeleton className="h-32 w-full bg-slate-800" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32 bg-slate-800" />
        <Skeleton className="h-10 w-32 bg-slate-800" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24 bg-slate-800" />
            <Skeleton className="h-4 w-4 rounded bg-slate-800" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-slate-800" />
            <Skeleton className="mt-2 h-3 w-32 bg-slate-800" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
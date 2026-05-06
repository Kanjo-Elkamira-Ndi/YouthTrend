import { Skeleton } from "@/components/ui/skeleton";

export const PostCardSkeleton = () => (
  <div className="yt-card p-4 sm:p-5 space-y-3">
    <Skeleton className="aspect-video w-full rounded-xl" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
    <div className="flex items-center gap-2 pt-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="flex gap-3 pt-2">
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-3 w-10" />
    </div>
  </div>
);

export const FeedSkeleton = () => (
  <div className="space-y-5">
    {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
  </div>
);

export const WriterCardSkeleton = () => (
  <div className="yt-card overflow-hidden">
    <Skeleton className="h-16 w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="-mt-12 h-14 w-14 rounded-full border-4 border-background" />
      <Skeleton className="h-5 w-32 mt-2" />
      <Skeleton className="h-3 w-24" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  </div>
);

export const NotificationSkeleton = () => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton className="h-9 w-9 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-2 w-2 rounded-full" />
  </div>
);

export const NotificationListSkeleton = () => (
  <div className="yt-card divide-y divide-border">
    {Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="yt-card h-24 p-4 flex items-center gap-3">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-2 w-12" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="grid grid-cols-5 gap-3 px-4 py-3 border-b border-border">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/3" />
  </div>
);

export const TableSkeleton = () => (
  <div className="yt-card overflow-hidden">
    <div className="grid grid-cols-5 gap-3 px-4 py-3 border-b border-border bg-muted/40">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-3/4" />)}
    </div>
    {Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)}
  </div>
);

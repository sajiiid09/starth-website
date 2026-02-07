import { cn } from "@/lib/utils";

interface RouteLoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export default function RouteLoader({ 
  fullScreen = false, 
  message = "Loading..." 
}: RouteLoaderProps) {
  return (
    <div 
      className={cn(
        "flex w-full items-center justify-center px-4",
        fullScreen ? "min-h-screen" : "min-h-[50vh] py-12"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Branded Loader Animation */}
        <div className="relative">
          {/* Outer ring */}
          <div className="h-12 w-12 rounded-full border-2 border-brand-teal/20" />
          {/* Spinning arc */}
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-brand-teal" 
               style={{ animationDuration: '0.8s' }} />
          {/* Center dot pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 animate-pulse rounded-full bg-brand-teal" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-brand-dark/70">{message}</span>
          <span className="flex gap-0.5">
            <span className="animate-loader-dot h-1 w-1 rounded-full bg-brand-teal" style={{ animationDelay: '0ms' }} />
            <span className="animate-loader-dot h-1 w-1 rounded-full bg-brand-teal" style={{ animationDelay: '150ms' }} />
            <span className="animate-loader-dot h-1 w-1 rounded-full bg-brand-teal" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for content placeholders
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-brand-dark/5", className)} />
  );
}

// Card skeleton for dashboard items
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-white p-6">
      <div className="flex items-start gap-4">
        <SkeletonLoader className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-3">
          <SkeletonLoader className="h-4 w-2/3" />
          <SkeletonLoader className="h-3 w-full" />
          <SkeletonLoader className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}

// List skeleton for message/event lists
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-brand-dark/5 bg-white p-4">
          <SkeletonLoader className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-1/3" />
            <SkeletonLoader className="h-3 w-2/3" />
          </div>
          <SkeletonLoader className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

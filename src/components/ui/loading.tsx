import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Loading({ className }: { className?: string }) {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className={cn("pl-4", className)}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[450px]" />
            <Skeleton className="h-4 w-[350px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

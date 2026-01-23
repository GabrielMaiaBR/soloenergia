import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted",
                className
            )}
        />
    );
}

interface SkeletonCardProps {
    className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-4 space-y-3", className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

export function SkeletonKPI() {
    return (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-[40px] w-full rounded" />
        </div>
    );
}

export function SkeletonClientCard() {
    return (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
        </div>
    );
}

export function SkeletonChart() {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
    );
}

"use client";

/**
 * SkeletonCard — animated shimmer placeholder used while products load.
 * Matches the exact dimensions of ProductCard to prevent layout shift.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-cream-deep/50 flex flex-col">
      {/* Image placeholder */}
      <div className="skeleton h-60 w-full rounded-none" />

      {/* Content placeholder */}
      <div className="p-5 flex flex-col gap-3">
        {/* Category badge */}
        <div className="skeleton h-4 w-20 rounded-full" />

        {/* Product name */}
        <div className="skeleton h-5 w-3/4 rounded-lg" />

        {/* Description */}
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-2/3 rounded" />
        </div>

        {/* Price + button row */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="skeleton h-6 w-16 rounded-lg" />
          <div className="skeleton h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonGrid — renders N skeleton cards in a responsive grid.
 * Use while fetching product data.
 */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

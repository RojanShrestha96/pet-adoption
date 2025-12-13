import React from 'react';
interface SkeletonProps {
  className?: string;
}
const Shimmer = () => <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />;
export function SkeletonCard({
  className = ''
}: SkeletonProps) {
  return <div className={`bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-sm ${className}`}>
      {/* Image placeholder */}
      <div className="relative w-full aspect-[4/3] bg-gray-200 overflow-hidden">
        <Shimmer />
      </div>
      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <div className="relative h-6 bg-gray-200 rounded-md w-3/4 overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-4 bg-gray-200 rounded-md w-1/2 overflow-hidden">
          <Shimmer />
        </div>
        <div className="flex justify-between pt-2">
          <div className="relative h-8 bg-gray-200 rounded-md w-1/3 overflow-hidden">
            <Shimmer />
          </div>
          <div className="relative h-8 bg-gray-200 rounded-md w-1/3 overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>;
}
export function SkeletonText({
  className = ''
}: SkeletonProps) {
  return <div className={`relative bg-gray-200 rounded-md overflow-hidden ${className}`}>
      <Shimmer />
    </div>;
}
export function SkeletonCircle({
  className = ''
}: SkeletonProps) {
  return <div className={`relative bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <Shimmer />
    </div>;
}
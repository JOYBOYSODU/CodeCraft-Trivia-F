import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-4" />
      <div className="h-3 bg-slate-700 rounded w-full mb-2" />
      <div className="h-3 bg-slate-700 rounded w-5/6 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 bg-slate-700 rounded w-20" />
        <div className="h-6 bg-slate-700 rounded w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-700 rounded flex-1 animate-pulse" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4 bg-slate-800/50 rounded-lg">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="h-3 bg-slate-700 rounded flex-1 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-slate-700 rounded animate-pulse ${
            i === lines - 1 ? 'w-4/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16';
  return <div className={`${sizeClass} bg-slate-700 rounded-full animate-pulse`} />;
}

export default function Skeleton({ variant = 'card', ...props }) {
  switch (variant) {
    case 'table':
      return <SkeletonTable {...props} />;
    case 'text':
      return <SkeletonText {...props} />;
    case 'avatar':
      return <SkeletonAvatar {...props} />;
    default:
      return <SkeletonCard {...props} />;
  }
}

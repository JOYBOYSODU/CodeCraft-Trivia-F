import React from 'react';

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/40',
    text: 'text-slate-400',
    dot: 'bg-slate-400'
  },
  UPCOMING: {
    label: 'Upcoming',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    dot: 'bg-blue-400'
  },
  LIVE: {
    label: 'Live',
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    text: 'text-green-400',
    dot: 'bg-green-400'
  },
  ENDED: {
    label: 'Ended',
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-400',
    dot: 'bg-red-400'
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/40',
    text: 'text-gray-400',
    dot: 'bg-gray-400'
  }
};

export default function ContestStatusBadge({ status = 'DRAFT', showDot = true, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.bg} ${config.border} ${config.text} ${sizeClass}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === 'LIVE' ? 'animate-pulse' : ''}`} />
      )}
      {config.label}
    </span>
  );
}

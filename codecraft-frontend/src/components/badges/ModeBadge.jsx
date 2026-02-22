import React from 'react';
import { Target, Hammer, Crown } from 'lucide-react';

const MODE_CONFIG = {
  PRECISION: {
    label: 'Precision',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    icon: Target
  },
  GRINDER: {
    label: 'Grinder',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
    icon: Hammer
  },
  LEGEND: {
    label: 'Legend',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
    text: 'text-purple-400',
    icon: Crown
  }
};

export default function ModeBadge({ mode = 'PRECISION', showIcon = true, size = 'sm' }) {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.PRECISION;
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.bg} ${config.border} ${config.text} ${sizeClass}`}>
      {showIcon && <Icon size={iconSize} />}
      {config.label}
    </span>
  );
}

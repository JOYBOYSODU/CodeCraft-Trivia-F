import React from 'react';
import { Trophy } from 'lucide-react';

const TIER_STYLES = {
  BRONZE: {
    bg: 'bg-amber-700/20',
    border: 'border-amber-700/40',
    text: 'text-amber-700',
    icon: 'text-amber-600'
  },
  SILVER: {
    bg: 'bg-slate-400/20',
    border: 'border-slate-400/40',
    text: 'text-slate-400',
    icon: 'text-slate-300'
  },
  GOLD: {
    bg: 'bg-yellow-400/20',
    border: 'border-yellow-400/40',
    text: 'text-yellow-400',
    icon: 'text-yellow-300'
  }
};

const SIZE_STYLES = {
  S: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 12
  },
  M: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    icon: 14
  },
  L: {
    padding: 'px-4 py-1.5',
    text: 'text-base',
    icon: 16
  }
};

export default function TierBadge({ tier = 'BRONZE', size = 'M', showIcon = true }) {
  const tierStyle = TIER_STYLES[tier] || TIER_STYLES.BRONZE;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.M;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${tierStyle.bg} ${tierStyle.border} ${tierStyle.text} ${sizeStyle.padding} ${sizeStyle.text}`}>
      {showIcon && <Trophy size={sizeStyle.icon} className={tierStyle.icon} />}
      {tier}
    </span>
  );
}

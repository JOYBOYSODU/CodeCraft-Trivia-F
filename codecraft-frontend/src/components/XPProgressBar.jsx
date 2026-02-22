import React from 'react';

const TIER_CONFIG = {
  BRONZE: {
    bg: 'bg-amber-700',
    range: [0, 1000]
  },
  SILVER: {
    bg: 'bg-slate-400',
    range: [1000, 3000]
  },
  GOLD: {
    bg: 'bg-yellow-400',
    range: [3000, 10000]
  }
};

export default function XPProgressBar({ currentXP = 0, size = 'md', showLabel = true }) {
  // Determine current tier
  let tier = 'BRONZE';
  if (currentXP >= 3000) tier = 'GOLD';
  else if (currentXP >= 1000) tier = 'SILVER';

  const tierConfig = TIER_CONFIG[tier];
  const [min, max] = tierConfig.range;
  const progress = Math.min(100, ((currentXP - min) / (max - min)) * 100);

  const nextTier = tier === 'BRONZE' ? 'SILVER' : tier === 'SILVER' ? 'GOLD' : null;
  const xpNeeded = nextTier ? TIER_CONFIG[nextTier].range[0] - currentXP : 0;

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2.5' : 'h-4';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2 text-xs text-slate-400">
          <span className="font-semibold">{tier} Tier</span>
          <span>
            {currentXP} XP
            {nextTier && ` • ${xpNeeded} to ${nextTier}`}
          </span>
        </div>
      )}
      
      <div className="relative w-full bg-slate-700 rounded-full overflow-hidden">
        {/* Bronze segment */}
        <div
          className={`absolute left-0 top-0 bottom-0 ${TIER_CONFIG.BRONZE.bg} opacity-20 ${heightClass}`}
          style={{ width: '33.33%' }}
        />
        
        {/* Silver segment */}
        <div
          className={`absolute top-0 bottom-0 ${TIER_CONFIG.SILVER.bg} opacity-20 ${heightClass}`}
          style={{ left: '33.33%', width: '33.33%' }}
        />
        
        {/* Gold segment */}
        <div
          className={`absolute right-0 top-0 bottom-0 ${TIER_CONFIG.GOLD.bg} opacity-20 ${heightClass}`}
          style={{ width: '33.34%' }}
        />

        {/* Progress fill */}
        <div
          className={`relative ${tierConfig.bg} transition-all duration-500 ${heightClass}`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

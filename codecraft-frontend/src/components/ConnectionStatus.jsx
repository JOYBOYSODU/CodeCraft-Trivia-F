import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  connected: {
    icon: Wifi,
    color: 'bg-green-500',
    text: 'text-green-500',
    label: 'Connected'
  },
  connecting: {
    icon: Loader2,
    color: 'bg-yellow-500',
    text: 'text-yellow-500',
    label: 'Connecting...',
    animate: 'animate-spin'
  },
  disconnected: {
    icon: WifiOff,
    color: 'bg-red-500',
    text: 'text-red-500',
    label: 'Disconnected'
  }
};

export default function ConnectionStatus({ status = 'disconnected', showLabel = false, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;
  const Icon = config.icon;
  
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`${dotSize} rounded-full ${config.color} ${status === 'connected' ? 'animate-pulse' : ''}`} />
      {showLabel && (
        <>
          <Icon size={iconSize} className={`${config.text} ${config.animate || ''}`} />
          <span className={`text-xs font-medium ${config.text}`}>
            {config.label}
          </span>
        </>
      )}
    </div>
  );
}

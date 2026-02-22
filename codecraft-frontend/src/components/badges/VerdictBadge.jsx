import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Zap, Code } from 'lucide-react';

const VERDICT_CONFIG = {
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    text: 'text-green-500',
    icon: CheckCircle
  },
  WRONG_ANSWER: {
    label: 'Wrong Answer',
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-500',
    icon: XCircle
  },
  TIME_LIMIT_EXCEEDED: {
    label: 'Time Limit',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/40',
    text: 'text-orange-500',
    icon: Clock
  },
  RUNTIME_ERROR: {
    label: 'Runtime Error',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
    text: 'text-purple-500',
    icon: AlertTriangle
  },
  COMPILATION_ERROR: {
    label: 'Compilation Error',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-500',
    icon: Code
  },
  MEMORY_LIMIT_EXCEEDED: {
    label: 'Memory Limit',
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/40',
    text: 'text-pink-500',
    icon: Zap
  }
};

export default function VerdictBadge({ verdict, size = 'sm', showIcon = true }) {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.WRONG_ANSWER;
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

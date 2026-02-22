import React from 'react';

const DIFFICULTY_STYLES = {
  EASY: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    text: 'text-green-500'
  },
  MEDIUM: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-500'
  },
  HARD: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-500'
  }
};

export default function DifficultyBadge({ difficulty = 'MEDIUM', size = 'sm' }) {
  const style = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.MEDIUM;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${style.bg} ${style.border} ${style.text} ${sizeClass}`}>
      {difficulty}
    </span>
  );
}

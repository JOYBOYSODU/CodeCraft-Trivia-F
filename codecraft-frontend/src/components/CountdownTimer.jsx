import React, { useState, useEffect } from 'react';

const STATES = {
  CRITICAL: { text: 'text-red-500', threshold: 300 }, // < 5 mins
  WARNING: { text: 'text-yellow-500', threshold: 1800 }, // < 30 mins
  NORMAL: { text: 'text-slate-300' }
};

export default function CountdownTimer({ endTime, onComplete, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [state, setState] = useState('NORMAL');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      return diff;
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0 && onComplete) {
        onComplete();
      }

      // Update state based on time remaining
      if (remaining < STATES.CRITICAL.threshold) {
        setState('CRITICAL');
      } else if (remaining < STATES.WARNING.threshold) {
        setState('WARNING');
      } else {
        setState('NORMAL');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const stateStyle = STATES[state];

  return (
    <span className={`font-mono font-bold ${stateStyle.text} ${className}`}>
      {formatTime(timeLeft)}
    </span>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

/**
 * CountdownTimer renders a visual SVG circular countdown timer.
 * @param {Object} props
 * @param {number} props.initialSeconds - Starting seconds (default 300 / 5 mins)
 * @param {Function} props.onTimeUp - Callback triggered when timer reaches 0
 * @param {boolean} props.isActive - Whether the timer is currently running
 */
export default function CountdownTimer({ initialSeconds = 300, onTimeUp, isActive = true }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const timerRef = useRef(null);

  // Sync internal state if initialSeconds changes
  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, onTimeUp]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // SVG parameters
  const radius = 40;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / initialSeconds) * circumference;

  // Determine color states based on remaining time percentage
  const percentage = (timeLeft / initialSeconds) * 100;
  let strokeColor = "stroke-emerald-400";
  let textColor = "text-emerald-400";
  let pulseClass = "";

  if (percentage <= 20) {
    strokeColor = "stroke-rose-500";
    textColor = "text-rose-500 font-bold";
    pulseClass = "animate-pulse";
  } else if (percentage <= 50) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-500";
  }

  return (
    <div className="flex items-center gap-4 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800 shadow-inner">
      <div className={`relative flex items-center justify-center w-16 h-16 ${pulseClass}`}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="stroke-slate-800 fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className={`fill-none timer-circle ${strokeColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className={`w-5 h-5 opacity-40 ${textColor}`} />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">
          Time Remaining
        </span>
        <span className={`text-xl font-mono leading-none tracking-tight transition-colors ${textColor}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
}

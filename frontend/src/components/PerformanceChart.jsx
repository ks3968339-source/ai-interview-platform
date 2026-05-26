import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

/**
 * PerformanceChart renders a gorgeous pure-SVG trend line chart of scores over time.
 * @param {Object} props
 * @param {Array} props.history - Chronological array of answers { score: number, category: string, date: string }
 */
export default function PerformanceChart({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-64 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-slate-500 mb-3 animate-pulse" />
        <p className="text-slate-400 font-medium">No performance data yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Complete your first interview question practice to trigger timeline tracking.</p>
      </div>
    );
  }

  // Cap history to last 7 attempts for layout clarity
  const data = history.slice(-7);
  const scores = data.map(d => d.score);
  
  // Dimensions
  const width = 500;
  const height = 150;
  const paddingX = 40;
  const paddingY = 20;

  // Chart boundaries
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Coordinates calculators
  const getX = (index) => {
    if (data.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (score) => {
    // Score is 1 to 10. Map 10 to top (paddingY) and 0 to bottom (height - paddingY)
    return height - paddingY - (score / 10) * chartHeight;
  };

  // Build the path SVG commands
  let linePath = "";
  let areaPath = "";

  if (data.length > 0) {
    const points = data.map((d, i) => `${getX(i)},${getY(d.score)}`);
    linePath = `M ${points.join(' L ')}`;
    
    // For filling the area below the line
    const startX = getX(0);
    const endX = getX(data.length - 1);
    const bottomY = height - paddingY;
    areaPath = `${linePath} L ${endX},${bottomY} L ${startX},${bottomY} Z`;
  }

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-[280px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Performance Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Your last {data.length} practice scores (out of 10)</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full">
          <span>Active Tracking</span>
        </div>
      </div>

      {/* Embedded SVG Chart */}
      <div className="w-full flex-grow flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            {/* Gradient for the line */}
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            
            {/* Gradient for the filled area */}
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* horizontal helper gridlines */}
          {[0, 5, 10].map((gridScore) => {
            const gridY = getY(gridScore);
            return (
              <g key={gridScore} className="opacity-25">
                <line 
                  x1={paddingX} 
                  y1={gridY} 
                  x2={width - paddingX} 
                  y2={gridY} 
                  stroke="#475569" 
                  strokeWidth="0.5" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingX - 10} 
                  y={gridY + 4} 
                  fill="#94a3b8" 
                  fontSize="8" 
                  textAnchor="end"
                  className="font-mono"
                >
                  {gridScore}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          {data.length > 0 && (
            <path d={areaPath} fill="url(#areaGrad)" />
          )}

          {/* Main trend line */}
          {data.length > 0 && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#lineGrad)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {data.map((d, i) => {
            const px = getX(i);
            const py = getY(d.score);
            return (
              <g key={i} className="group cursor-pointer">
                {/* Glow ring */}
                <circle 
                  cx={px} 
                  cy={py} 
                  r="6" 
                  className="fill-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
                {/* Core point */}
                <circle 
                  cx={px} 
                  cy={py} 
                  r="3.5" 
                  className="fill-slate-900 stroke-cyan-400 stroke-2"
                />
                {/* Score text tooltip on hover */}
                <text
                  x={px}
                  y={py - 10}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950 font-mono"
                >
                  {d.score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Categories footer indicator */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/40 text-[10px] text-slate-500 font-medium">
        <span>Oldest</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Score Line</span>
        </div>
        <span>Latest</span>
      </div>
    </div>
  );
}

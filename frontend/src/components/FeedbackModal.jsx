import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, X, Award, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * FeedbackModal displays the AI-generated evaluation report.
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility trigger
 * @param {Object} props.feedback - The feedback object { score, whatWasDoneWell, actionableInsights, optimizedAnswer }
 * @param {string} props.questionText - The question text
 * @param {Function} props.onClose - Dismiss handler
 */
export default function FeedbackModal({ isOpen, feedback, questionText, onClose }) {
  const [activeTab, setActiveTab] = useState('strengths'); // strengths, insights, model

  // Fire confetti celebration on successful evaluation with high score (>= 8)
  useEffect(() => {
    if (isOpen && feedback && feedback.score >= 8) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Confetti from two corners
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, feedback]);

  if (!isOpen || !feedback) return null;

  // Determine score color grading
  let scoreColor = "text-rose-500 border-rose-500/30 bg-rose-500/5";
  let scoreBadge = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  let ratingText = "Needs Practice";

  if (feedback.score >= 8) {
    scoreColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
    scoreBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    ratingText = "Excellent!";
  } else if (feedback.score >= 5) {
    scoreColor = "text-amber-400 border-amber-500/30 bg-amber-500/5";
    scoreBadge = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    ratingText = "Good Effort";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060f]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-auto md:h-[650px] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Score & Category Overview */}
        <div className="w-full md:w-1/3 bg-[#0b0e1b] p-8 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col justify-between items-center text-center">
          <div className="flex flex-col items-center mt-6">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">Evaluation Result</h2>
            <p className="text-xs text-slate-500 mt-1">AI Interview Insight Engine</p>
          </div>

          {/* Glowing Animated Circular Score */}
          <div className="my-8 relative flex flex-col items-center justify-center">
            <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center ${scoreColor} shadow-[0_0_30px_rgba(99,102,241,0.05)]`}>
              <span className="text-5xl font-extrabold tracking-tight">{feedback.score}</span>
              <span className="text-xs opacity-55 font-semibold mt-1">/ 10</span>
            </div>
            <span className={`mt-4 px-3 py-1 text-xs font-semibold rounded-full ${scoreBadge}`}>
              {ratingText}
            </span>
          </div>

          <div className="w-full mt-auto bg-slate-900/50 border border-slate-800/50 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left mb-1">Target Question</p>
            <p className="text-xs text-slate-400 text-left line-clamp-3 leading-relaxed">
              "{questionText}"
            </p>
          </div>
        </div>

        {/* Right Side: Tabbed Deep-Dive Feedback */}
        <div className="w-full md:w-2/3 p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Tab Navigations */}
            <div className="flex border-b border-slate-800/80 mb-6 gap-2">
              <button
                onClick={() => setActiveTab('strengths')}
                className={`pb-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 flex items-center gap-2 ${
                  activeTab === 'strengths' 
                    ? 'border-emerald-400 text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`pb-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 flex items-center gap-2 ${
                  activeTab === 'insights' 
                    ? 'border-amber-400 text-amber-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Missing Insights
              </button>
              <button
                onClick={() => setActiveTab('model')}
                className={`pb-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 flex items-center gap-2 ${
                  activeTab === 'model' 
                    ? 'border-primary-400 text-primary-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Model Answer
              </button>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[280px] text-slate-300 leading-relaxed text-sm">
              {activeTab === 'strengths' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold text-base mb-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <h3>What You Did Well</h3>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                    <p className="whitespace-pre-line text-slate-300 leading-relaxed">
                      {feedback.whatWasDoneWell}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3 text-amber-400 font-bold text-base mb-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <h3>Actionable Suggestions</h3>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl">
                    <p className="whitespace-pre-line text-slate-300 leading-relaxed">
                      {feedback.actionableInsights}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'model' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3 text-indigo-400 font-bold text-base mb-2">
                    <Lightbulb className="w-5 h-5 flex-shrink-0" />
                    <h3>Ideal Reference Answer</h3>
                  </div>
                  <div className="bg-[#0b0e1b] border border-slate-800/80 p-5 rounded-2xl overflow-y-auto max-h-[300px] font-mono text-xs leading-relaxed text-indigo-200">
                    <p className="whitespace-pre-line">
                      {feedback.optimizedAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="btn-neon-primary flex items-center gap-2 group"
            >
              <span>Back to Dashboard</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

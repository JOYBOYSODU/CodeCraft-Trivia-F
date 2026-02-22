import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

/**
 * WelcomeRecommendModal
 * Shows when user logs in for the first time
 * Displays AI-powered personalized roadmap offer
 */
export default function WelcomeRecommendModal({
  isOpen,
  playerName = 'there',
  onViewRoadmap,
  onDismiss
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-6 relative">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-4xl">🤖</div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Coach</h2>
              <p className="text-yellow-100 text-sm">Your personal learning guide</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <p className="text-slate-800 font-semibold text-lg">
              Welcome back, <span className="text-yellow-600">{playerName}</span>!
            </p>
            
            <p className="text-slate-700 text-sm leading-relaxed">
              Your AI practice coach has analyzed your profile and built a <span className="text-yellow-600 font-semibold">personalized learning roadmap</span> tailored to your level and goals.
            </p>

            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs text-slate-700">
              <p className="flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-600 flex-shrink-0" />
                <span>Smart algorithm considers your solved problems, level, and preferred topics</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 flex gap-3 border-t border-yellow-200">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2.5 rounded-lg border border-yellow-300 text-slate-700 hover:bg-yellow-50 transition-colors font-medium text-sm"
          >
            Later
          </button>
          
          <button
            onClick={onViewRoadmap}
            className="flex-1 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-900 transition-colors font-bold text-sm flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            View Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}

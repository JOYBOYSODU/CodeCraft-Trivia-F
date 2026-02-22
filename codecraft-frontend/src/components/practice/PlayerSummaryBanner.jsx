import { Award, Trophy, Zap } from "lucide-react";

export default function PlayerSummaryBanner({ playerData, summary, readyForDifficulty, motivationalMessage }) {
  return (
    <div className="bg-gradient-to-br from-white to-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 text-amber-700">
        <Award size={18} />
        <h2 className="text-sm font-semibold">Player Snapshot</h2>
      </div>

      <div>
        <p className="text-base text-slate-800 font-semibold">
          {playerData.name} · Level {playerData.level}
        </p>
        <p className="text-xs text-slate-600">
          {playerData.tier} · {playerData.subRank} · {playerData.preferredMode}
        </p>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>

      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <Trophy size={12} />
          {playerData.totalContests} contests
        </span>
        <span className="flex items-center gap-1">
          <Zap size={12} />
          Ready for {readyForDifficulty}
        </span>
      </div>

      <div className="text-xs text-amber-800 font-medium">{motivationalMessage}</div>
    </div>
  );
}

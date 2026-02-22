import { Tag, Timer, Sparkles } from "lucide-react";

const PRIORITY_STYLE = {
  HIGH: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  LOW: "bg-slate-600/20 text-slate-300 border-slate-500/30",
};

const DIFFICULTY_STYLE = {
  Easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Hard: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function RecommendationCard({ recommendation, problem }) {
  if (!problem) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            {problem.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1">{problem.description}</p>
        </div>
        <span
          className={`text-xs border rounded-full px-2 py-0.5 uppercase tracking-wide ${
            PRIORITY_STYLE[recommendation.priority] ?? PRIORITY_STYLE.MEDIUM
          }`}
        >
          {recommendation.priority}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`border rounded-full px-2 py-0.5 ${
            DIFFICULTY_STYLE[problem.difficulty] ?? DIFFICULTY_STYLE.Easy
          }`}
        >
          {problem.difficulty}
        </span>
        <span className="text-slate-700 font-medium">{problem.points} pts</span>
        <span className="flex items-center gap-1 text-slate-700">
          <Timer size={12} />
          {recommendation.estimatedMins} mins
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {problem.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-amber-800 border border-yellow-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-sm text-slate-700">
        <p className="leading-relaxed">{recommendation.reason}</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
        <Sparkles size={12} />
        <span>{recommendation.skillBuilt}</span>
      </div>
    </div>
  );
}

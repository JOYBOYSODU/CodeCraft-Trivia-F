import { Target } from "lucide-react";

export default function WeeklyGoalCard({ goal }) {
  if (!goal) return null;

  return (
    <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-300 rounded-lg p-4 space-y-2 shadow-sm">
      <div className="flex items-center gap-2 text-amber-700">
        <Target size={16} />
        <h3 className="text-sm font-semibold">Weekly Goal</h3>
      </div>
      <p className="text-2xl font-semibold text-slate-800">
        {goal.targetProblems} problems
      </p>
      <p className="text-xs text-slate-600">Focus: {goal.focusTopic}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{goal.message}</p>
    </div>
  );
}

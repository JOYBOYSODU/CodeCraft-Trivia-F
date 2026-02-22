import RecommendationCard from "./RecommendationCard";

export default function ProblemRoadmapList({ recommendations, problemBank }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 text-center text-slate-600">
        No recommendations yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const problem = problemBank.find((p) => p.id === rec.problemId);
        return (
          <RecommendationCard
            key={rec.problemId}
            recommendation={rec}
            problem={problem}
          />
        );
      })}
    </div>
  );
}

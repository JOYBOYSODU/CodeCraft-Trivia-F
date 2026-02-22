import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePlayerGoals } from "../../hooks/usePlayerGoals";
import {
  getAIRecommendations,
  saveRecommendations,
  getCachedRecommendations,
  clearRecommendationCache,
} from "../../lib/geminiRecommend";
import { PROBLEM_BANK } from "../../data/problems";
import RecommendationCard from "../../components/practice/RecommendationCard";
import PlayerSummaryBanner from "../../components/practice/PlayerSummaryBanner";
import WeeklyGoalCard from "../../components/practice/WeeklyGoalCard";
import ProblemRoadmapList from "../../components/practice/ProblemRoadmapList";
import AIAssistantChat from "../../components/practice/AIAssistantChat";
import { RefreshCw, Sparkles } from "lucide-react";

function getRelativeTime(timestamp) {
  if (!timestamp) return "";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `Last updated ${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `Last updated ${days} day${days === 1 ? "" : "s"} ago`;
}

export default function PracticePage() {
  const { user } = useAuth();
  const { playerData, goals, performance, loading: goalsLoading, error: goalsError, isUsingFallback, refetch } = usePlayerGoals(user?.id);
  
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const isFirstTime = useMemo(() => {
    if (!playerData) return false;
    return (playerData.context?.questionsSolved ?? []).length === 0;
  }, [playerData]);

  const loadRecommendations = async ({ force = false } = {}) => {
    try {
      setLoading(true);
      setError("");

      if (!force && playerData) {
        const cached = getCachedRecommendations(user?.id);
        if (cached) {
          setRecommendations(cached);
          const raw = localStorage.getItem(`ai_recommendations_${user?.id}`);
          const parsed = raw ? JSON.parse(raw) : null;
          setLastUpdated(parsed?.generatedAt ?? null);
          setLoading(false);
          return;
        }
      }

      // Only generate recommendations if we have player data
      if (!playerData) {
        setLoading(false);
        return;
      }

      const result = await getAIRecommendations(playerData, PROBLEM_BANK);
      if (result.error) {
        setError(result.error);
        setRecommendations(null);
        setLoading(false);
        return;
      }

      // Merge AI recommendations with backend goals
      const enrichedRecommendations = {
        ...result.data,
        weeklyGoal: goals?.weeklyGoal || result.data.weeklyGoal,
        readyForDifficulty: goals?.readyForDifficulty || result.data.readyForDifficulty,
      };

      setRecommendations(enrichedRecommendations);
      saveRecommendations(user?.id, enrichedRecommendations);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playerData) {
      loadRecommendations();
    }
  }, [playerData, goals]);

  const handleRefresh = () => {
    const ok = window.confirm(
      "Regenerate recommendations? This will use 1 AI credit."
    );
    if (!ok) return;
    clearRecommendationCache(user?.id);
    loadRecommendations({ force: true });
  };

  const lastUpdatedText = getRelativeTime(lastUpdated);

  // Determine overall loading state
  const isLoading = goalsLoading || loading;
  const hasError = goalsError || error;

  return (
    <div className="min-h-screen bg-yellow-50 text-slate-800 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <span>🤖 AI Practice Recommendations</span>
            </h1>
            <p className="text-sm text-slate-600">
              Your personalized learning roadmap
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdatedText && (
              <span className="text-xs text-slate-600">{lastUpdatedText}</span>
            )}
            {isUsingFallback && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                Demo Mode (Backend unavailable)
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-sm font-semibold"
            >
              <RefreshCw size={14} />
              Refresh Recommendations
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <div className="bg-white border border-yellow-200 rounded-xl p-6 animate-pulse">
              <p className="text-base font-semibold text-slate-800">🤖 AI is analyzing your profile...</p>
              <p className="text-sm text-slate-600 mt-2">
                Building your personalized roadmap
              </p>
              <div className="mt-4 h-2 bg-yellow-200 rounded-full w-1/2"></div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-white border border-yellow-200 rounded-xl p-4 animate-pulse"
                >
                  <div className="h-3 bg-yellow-200 rounded w-1/3"></div>
                  <div className="h-2 bg-yellow-200 rounded w-2/3 mt-3"></div>
                  <div className="h-2 bg-yellow-200 rounded w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && hasError && (
          <div className="bg-white border border-rose-300 rounded-xl p-6 text-center">
            <p className="text-rose-700 font-semibold">
              ⚠️ Could not load AI recommendations
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {hasError}
            </p>
            <button
              type="button"
              onClick={() => {
                refetch();
                loadRecommendations({ force: true });
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !hasError && recommendations && playerData && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-4 lg:col-span-1 bg-white rounded-xl p-4 border border-yellow-200">
              <PlayerSummaryBanner
                playerData={playerData}
                summary={recommendations.playerSummary}
                readyForDifficulty={recommendations.readyForDifficulty}
                motivationalMessage={recommendations.motivationalMessage}
              />
              <WeeklyGoalCard goal={recommendations.weeklyGoal} />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700">Weak Areas</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(performance?.weakAreas ?? recommendations.weakAreas ?? []).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700">Strengths</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(performance?.strengthAreas ?? recommendations.strengthAreas ?? []).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 bg-white rounded-xl p-4 border border-yellow-200">
              {isFirstTime && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
                  <Sparkles className="text-amber-600" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      👋 Welcome! We&apos;ve built your starter roadmap.
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Begin with these Easy problems to build your foundation.
                    </p>
                  </div>
                </div>
              )}

              <ProblemRoadmapList
                recommendations={recommendations.recommendations}
                problemBank={PROBLEM_BANK}
              />
            </div>

            {/* Right Sidebar - AI Chatbot */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden shadow-xl">
                <AIAssistantChat />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { playerGoalService, generateCompleteGoals } from "../services/playerGoalService";

// Fallback player data when backend endpoints are unavailable
const FALLBACK_PLAYER_DATA = {
  id: "user-demo",
  name: "Demo Player",
  email: "demo@codecraft.com",
  level: 5,
  tier: "Bronze",
  subRank: "Bronze II",
  xp: 1800,
  totalContests: 3,
  preferredMode: "GRINDER",
  stats: {
    totalSolved: 2,
    easySolved: 2,
    mediumSolved: 0,
    hardSolved: 0,
    acceptanceRate: 50,
  },
  context: {
    questionsSolved: [1, 5],
    languagesUsed: ["Python"],
    favouriteTag: "Array",
    tagsExplored: ["Array", "Binary Search"],
  },
};

const FALLBACK_PERFORMANCE = {
  weakAreas: ["Strings", "Trees"],
  strengthAreas: ["Arrays", "Sorting"],
  recentSubmissions: [],
};

/**
 * Hook to manage player goals
 * Fetches player snapshot, performance data, and calculates intelligent goals
 * Falls back to mock data if backend endpoints unavailable
 *
 * @param {string} userId - The user ID to fetch goals for
 * @returns {object} { goals, playerData, performance, loading, error, refetch, updateGoals, isUsingFallback }
 */
export function usePlayerGoals(userId) {
  const [goals, setGoals] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("No user ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);

      // Fetch player snapshot and performance in parallel
      let snapshotData, performanceData;

      try {
        const [snapshotRes, performanceRes] = await Promise.all([
          playerGoalService.getPlayerSnapshot(userId),
          playerGoalService.getPlayerPerformance(userId),
        ]);
        snapshotData = snapshotRes.data;
        performanceData = performanceRes.data;
      } catch (backendErr) {
        // Backend unavailable - use fallback data
        console.warn("Backend unavailable, using fallback data:", backendErr.message);
        snapshotData = FALLBACK_PLAYER_DATA;
        performanceData = FALLBACK_PERFORMANCE;
        setIsUsingFallback(true);
      }

      setPlayerData(snapshotData);
      setPerformance(performanceData);

      // Try to fetch existing goals from backend
      try {
        const goalsRes = await playerGoalService.getPlayerGoals(userId);
        setGoals(goalsRes.data);
      } catch {
        // If no goals exist, calculate them
        const calculatedGoals = generateCompleteGoals(snapshotData, performanceData);
        setGoals(calculatedGoals);

        // Optionally save the calculated goals (skip if using fallback)
        if (!isUsingFallback) {
          try {
            await playerGoalService.setPlayerGoals(userId, calculatedGoals);
          } catch (saveErr) {
            console.warn("Could not save calculated goals:", saveErr);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
      setError(err.response?.data?.message || "Failed to fetch goals");
      // Use fallback as last resort
      setPlayerData(FALLBACK_PLAYER_DATA);
      setPerformance(FALLBACK_PERFORMANCE);
      setIsUsingFallback(true);
      const fallbackGoals = generateCompleteGoals(FALLBACK_PLAYER_DATA, FALLBACK_PERFORMANCE);
      setGoals(fallbackGoals);
    } finally {
      setLoading(false);
    }
  }, [userId, isUsingFallback]);

  useEffect(() => {
    fetchGoals();
  }, [userId, fetchGoals]);

  /**
   * Update goals for the player
   * @param {object} newGoals - New goals object to save
   */
  const updateGoals = useCallback(
    async (newGoals) => {
      try {
        setLoading(true);
        await playerGoalService.setPlayerGoals(userId, newGoals);
        setGoals(newGoals);
        return { success: true };
      } catch (err) {
        console.error("Error updating goals:", err);
        setError(err.response?.data?.message || "Failed to update goals");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return {
    goals,
    playerData,
    performance,
    loading,
    error,
    isUsingFallback,
    refetch: fetchGoals,
    updateGoals,
  };
}

/**
 * Hook to fetch only goals (lightweight alternative to usePlayerGoals)
 * Use when you already have player data
 *
 * @param {string} userId - The user ID
 * @returns {object} { goals, loading, error, refetch, updateGoals }
 */
export function usePlayerGoalsOnly(userId) {
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("No user ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await playerGoalService.getPlayerGoals(userId);
      setGoals(response.data);
    } catch (err) {
      console.error("Error fetching goals only:", err);
      setError(err.response?.data?.message || "Failed to fetch goals");
      setGoals(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [userId, fetchGoals]);

  const updateGoals = useCallback(
    async (newGoals) => {
      try {
        setLoading(true);
        await playerGoalService.setPlayerGoals(userId, newGoals);
        setGoals(newGoals);
        return { success: true };
      } catch (err) {
        console.error("Error updating goals:", err);
        setError(err.response?.data?.message || "Failed to update goals");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    updateGoals,
  };
}

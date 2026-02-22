import { useState, useEffect, useCallback } from "react";
import { playerGoalService } from "../services/playerGoalService";

/**
 * Hook to fetch player snapshot data by user ID
 * Handles loading, error states, and provides refetch capability
 *
 * @param {string} userId - The user ID to fetch snapshot for
 * @returns {object} { playerData, loading, error, refetch }
 */
export function usePlayerSnapshot(userId) {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSnapshot = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("No user ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await playerGoalService.getPlayerSnapshot(userId);
      setPlayerData(response.data);
    } catch (err) {
      console.error("Error fetching player snapshot:", err);
      setError(err.response?.data?.message || "Failed to fetch player data");
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSnapshot();
  }, [userId, fetchSnapshot]);

  return {
    playerData,
    loading,
    error,
    refetch: fetchSnapshot,
  };
}

/**
 * Hook to track player snapshot cache to avoid unnecessary re-renders
 * @param {string} userId - The user ID
 * @returns {object} Memoized snapshot data
 */
export function usePlayerSnapshotMemo(userId) {
  const { playerData, loading, error, refetch } = usePlayerSnapshot(userId);

  // Return stable reference if data hasn't changed
  return {
    playerData:
      playerData && JSON.stringify(playerData),
    loading,
    error,
    refetch,
  };
}

import { useState, useEffect, useCallback } from 'react';
import {
  getAIRecommendations,
  saveRecommendations,
  getCachedRecommendations,
  clearRecommendationCache
} from '../lib/geminiRecommend';
import { PROBLEM_BANK } from '../data/problems';

/**
 * Custom hook to manage AI recommendations
 * Handles caching, loading, and error states
 * 
 * @param {Object} playerData - Player profile data
 * @returns {Object} recommendations, isLoading, error, generatedAt, isFirstTime, refresh
 */
export function useAIRecommendations(playerData) {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const userId = playerData?.id || playerData?.name || 'guest';

  const loadRecommendations = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    // Check if player is first time (no problems solved)
    const totalSolved = playerData?.context?.totalSolved || 0;
    setIsFirstTime(totalSolved === 0);

    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedRecommendations(userId);
      if (cached) {
        setRecommendations(cached);
        setIsLoading(false);
        return;
      }
    }

    // Call Gemini API for fresh recommendations
    const { data, error: aiError } = await getAIRecommendations(
      playerData,
      PROBLEM_BANK
    );

    if (aiError) {
      setError(aiError);
      setIsLoading(false);
      return;
    }

    setRecommendations(data);
    setGeneratedAt(new Date());
    saveRecommendations(userId, data);
    setIsLoading(false);
  }, [playerData, userId]);

  const refresh = () => {
    clearRecommendationCache(userId);
    loadRecommendations(true);
  };

  // Load recommendations on mount or when playerData changes
  useEffect(() => {
    if (playerData) {
      // Defer execution to avoid "setState synchronously within an effect" warning
      const timer = setTimeout(() => {
        loadRecommendations();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [playerData, loadRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    generatedAt,
    isFirstTime,
    refresh
  };
}

export default useAIRecommendations;

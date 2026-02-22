import axiosInstance from "../api/axiosInstance";

/**
 * Service for goal calculation and management
 * Intelligently sets weekly/monthly goals based on player performance
 */
export const playerGoalService = {
  /**
   * Fetch player snapshot by ID
   * @param {string} userId - Player user ID
   */
  getPlayerSnapshot: (userId) =>
    axiosInstance.get(`/player/${userId}/snapshot`),

  /**
   * Get or calculate player goals
   * @param {string} userId - Player user ID
   */
  getPlayerGoals: (userId) =>
    axiosInstance.get(`/player/${userId}/goals`),

  /**
   * Save/update player goals
   * @param {string} userId - Player user ID
   * @param {object} goals - Goals object with weeklyGoal, monthlyGoal, etc
   */
  setPlayerGoals: (userId, goals) =>
    axiosInstance.post(`/player/${userId}/goals`, goals),

  /**
   * Get player performance metrics (weak/strong areas)
   * @param {string} userId - Player user ID
   */
  getPlayerPerformance: (userId) =>
    axiosInstance.get(`/player/${userId}/performance`),
};

/**
 * Intelligently calculate weekly goal based on player stats
 * @param {object} playerData - Player snapshot data
 * @param {object} performance - Player performance metrics
 * @returns {object} Weekly goal object
 */
export function calculateWeeklyGoal(playerData, performance) {
  const { stats, tier } = playerData;
  const { weakAreas = [], strengthAreas = [] } = performance;

  // Determine target problems based on level and tier
  let targetProblems = 3; // default
  if (tier === "Bronze") targetProblems = 2;
  else if (tier === "Silver") targetProblems = 3;
  else if (tier === "Gold") targetProblems = 4;
  else if (tier === "Platinum") targetProblems = 5;

  // Adjust based on acceptance rate
  const acceptanceRate = stats?.acceptanceRate || 50;
  if (acceptanceRate < 40) targetProblems = Math.max(2, targetProblems - 1); // Struggling
  else if (acceptanceRate > 80) targetProblems = Math.min(6, targetProblems + 1); // Thriving

  // Pick focus topic from weak areas (if exists) or from strength areas
  const focusTopic = weakAreas.length > 0 ? weakAreas[0] : strengthAreas[0] || "Arrays";

  // Generate motivational message based on performance
  let message = `This week: solve ${targetProblems} ${focusTopic} problems`;
  if (acceptanceRate > 75) {
    message += " - you're on fire! 🔥";
  } else if (acceptanceRate < 50) {
    message += " - let's build momentum 💪";
  } else {
    message += " - steady progress 📈";
  }

  return {
    targetProblems,
    focusTopic,
    message,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculate monthly goal based on weekly goals and performance
 * @param {object} playerData - Player snapshot data
 * @param {object} performance - Player performance metrics
 * @returns {object} Monthly goal object
 */
export function calculateMonthlyGoal(playerData, performance) {
  const { stats } = playerData;
  const weeklyGoal = calculateWeeklyGoal(playerData, performance);

  // Monthly = 4 * weekly, but cap it
  const targetProblems = Math.min(20, weeklyGoal.targetProblems * 4);

  // Determine difficulty progression
  const easyCount = stats?.easySolved || 0;
  const mediumCount = stats?.mediumSolved || 0;

  let targetDifficulty = "EASY";
  if (easyCount >= 10 && mediumCount >= 5) {
    targetDifficulty = "MEDIUM";
  } else if (mediumCount >= 15) {
    targetDifficulty = "HARD";
  }

  return {
    targetProblems,
    targetDifficulty,
    message: `Monthly mission: ${targetProblems} problems (mix of ${targetDifficulty})`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Determine ready difficulty level based on solved problems
 * @param {object} stats - Player stats object
 * @returns {string} Difficulty level (EASY, MEDIUM, HARD)
 */
export function calculateReadyDifficulty(stats) {
  const { easySolved = 0, mediumSolved = 0, hardSolved = 0 } = stats;

  if (hardSolved >= 5) return "HARD";
  if (mediumSolved >= 10 && easySolved >= 5) return "MEDIUM";
  if (easySolved >= 3) return "MEDIUM";
  return "EASY";
}

/**
 * Generate complete goals object with weekly, monthly, and difficulty
 * @param {object} playerData - Full player snapshot
 * @param {object} performance - Performance metrics
 * @returns {object} Complete goals object
 */
export function generateCompleteGoals(playerData, performance) {
  return {
    weeklyGoal: calculateWeeklyGoal(playerData, performance),
    monthlyGoal: calculateMonthlyGoal(playerData, performance),
    readyForDifficulty: calculateReadyDifficulty(playerData.stats),
  };
}

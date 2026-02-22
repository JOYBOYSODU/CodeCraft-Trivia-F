import { GoogleGenAI } from "@google/genai";

let ai = null;

function initializeAI() {
  if (ai) return ai;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Please add it to your .env file."
    );
  }

  ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  return ai;
}

// Mock recommendations for demo/fallback purposes
const MOCK_RECOMMENDATIONS = {
  "playerSummary": "You're at Bronze II level with solid fundamentals in Arrays and Binary Search. You've completed 2 easy problems and are ready to explore new topics like Stack, Linked Lists, and Dynamic Programming.",
  "weakAreas": ["Stack", "String", "Linked List", "DP", "Sliding Window", "Two Pointers"],
  "strengthAreas": ["Array", "Binary Search"],
  "readyForDifficulty": "Easy",
  "motivationalMessage": "Great progress! You've built a strong foundation. Time to expand into new data structures!",
  "recommendations": [
    {
      "problemId": 2,
      "priority": "HIGH",
      "reason": "Valid Parentheses is the classic Stack problem. Stack knowledge is crucial for many advanced problems.",
      "estimatedMins": 20,
      "skillBuilt": "Stack data structure fundamentals"
    },
    {
      "problemId": 4,
      "priority": "HIGH",
      "reason": "Linked List is a core topic you haven't touched yet. This is the perfect entry point.",
      "estimatedMins": 25,
      "skillBuilt": "Linked List pointer manipulation"
    },
    {
      "problemId": 7,
      "priority": "HIGH",
      "reason": "Dynamic Programming is essential for medium problems. Climbing Stairs introduces DP with simple logic.",
      "estimatedMins": 20,
      "skillBuilt": "Dynamic Programming basics"
    },
    {
      "problemId": 8,
      "priority": "MEDIUM",
      "reason": "Now that you know Linked Lists, this merging problem builds on that knowledge naturally.",
      "estimatedMins": 25,
      "skillBuilt": "Linked List traversal and merging"
    },
    {
      "problemId": 3,
      "priority": "MEDIUM",
      "reason": "Sliding Window is a powerful technique for substring problems. Time to master it.",
      "estimatedMins": 35,
      "skillBuilt": "Sliding Window pattern"
    },
    {
      "problemId": 6,
      "priority": "MEDIUM",
      "reason": "Kadane's algorithm is the iconic DP problem. A must-know for technical interviews.",
      "estimatedMins": 30,
      "skillBuilt": "Kadane's algorithm, DP optimization"
    },
    {
      "problemId": 9,
      "priority": "LOW",
      "reason": "Two Pointers is powerful on arrays. Attempt after mastering easy problems.",
      "estimatedMins": 40,
      "skillBuilt": "Two Pointer technique"
    },
    {
      "problemId": 10,
      "priority": "LOW",
      "reason": "Hard difficulty. This is your long-term goal after solving all medium problems.",
      "estimatedMins": 60,
      "skillBuilt": "Advanced Two Pointers, problem decomposition"
    }
  ],
  "weeklyGoal": {
    "targetProblems": 3,
    "focusTopic": "Stack",
    "message": "This week: solve Valid Parentheses, Reverse Linked List, and Climbing Stairs. These 3 open up entirely new topic areas for you."
  }
};

export async function getAIRecommendations(playerData, problemBank) {
  const solvedIds = playerData.context.questionsSolved || [];
  const solvedProblems = problemBank.filter((p) => solvedIds.includes(p.id));
  const unsolvedProblems = problemBank.filter((p) => !solvedIds.includes(p.id));

  const prompt = `
You are an expert coding coach for a competitive programming platform.
Analyze this player's profile and recommend a personalized practice roadmap.

═══ PLAYER PROFILE ═══
Name: ${playerData.name}
Level: ${playerData.level} (${playerData.tier} - ${playerData.subRank})
XP: ${playerData.xp}
Total Contests Entered: ${playerData.totalContests}
Preferred Mode: ${playerData.preferredMode}
Favourite Topic: ${playerData.context.favouriteTag || "None yet"}

═══ PROBLEMS SOLVED ═══
Total Solved: ${playerData.context.totalSolved} / ${problemBank.length}
Easy Solved:   ${playerData.context.easySolved}
Medium Solved: ${playerData.context.mediumSolved}
Hard Solved:   ${playerData.context.hardSolved}

Already solved these problems:
${
  solvedProblems.length > 0
    ? solvedProblems
        .map((p) => `- ${p.title} (${p.difficulty}) [${p.tags.join(", ")}]`)
        .join("\n")
    : "- None yet (brand new player)"
}

Topics explored so far: ${playerData.context.tagsExplored.join(", ") || "None"}
Languages used: ${playerData.context.languagesUsed.join(", ") || "None"}

═══ AVAILABLE UNSOLVED PROBLEMS ═══
${unsolvedProblems
  .map(
    (p) =>
      `ID:${p.id} | ${p.title} | ${p.difficulty} | ${p.points}pts | Tags: ${p.tags.join(", ")}`
  )
  .join("\n")}

═══ YOUR TASK ═══
Based on this player's current skill level and what they have solved:

1. Identify their WEAK areas (topics they haven't explored)
2. Identify their NEXT STEP difficulty (what they are ready for)
3. Recommend ALL unsolved problems in a smart learning order
4. Give each problem a priority: HIGH, MEDIUM, or LOW
5. Write a short personalized reason for each recommendation

RULES:
- Beginners (level 1-5, few solved): recommend Easy first, build foundation
- Intermediate (level 6-15, some Medium solved): mix Easy + Medium
- Advanced (level 16+, Medium cleared): push toward Hard
- Always recommend problems that fill topic gaps first
- Never recommend already solved problems
- Order from most urgent to least urgent

RESPOND WITH ONLY VALID JSON. No markdown. No explanation outside JSON.
No backticks. Pure raw JSON only.

Return this exact structure:
{
  "playerSummary": "2-3 sentence honest assessment of player's current level and gaps",
  "weakAreas": ["topic1", "topic2"],
  "strengthAreas": ["topic3"],
  "readyForDifficulty": "Easy | Medium | Hard",
  "motivationalMessage": "Short encouraging message personalized to their name",
  "recommendations": [
    {
      "problemId": 2,
      "priority": "HIGH",
      "reason": "Why this specific problem should be solved next",
      "estimatedMins": 20,
      "skillBuilt": "What skill this builds"
    }
  ],
  "weeklyGoal": {
    "targetProblems": 3,
    "focusTopic": "Stack",
    "message": "This week focus on..."
  }
}
`;

  try {
    const aiClient = initializeAI();
    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text;

    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return { data: parsed, error: null };
  } catch (err) {
    console.error("Gemini recommendation error:", err);
    
    // Check if it's a quota error
    const isQuotaError = err?.status === "RESOURCE_EXHAUSTED" || 
                        err?.message?.includes("quota") ||
                        err?.message?.includes("429");
    
    // Fallback to mock recommendations for demo/testing
    if (isQuotaError) {
      console.warn("⚠️ API quota exceeded. Using demo recommendations.");
      return { 
        data: {
          ...MOCK_RECOMMENDATIONS,
          playerSummary: `${MOCK_RECOMMENDATIONS.playerSummary} (Demo Mode - API quota exceeded)`
        }, 
        error: null 
      };
    }
    
    // Any other error
    return {
      data: null,
      error: `Failed to get AI recommendations. ${isQuotaError ? 'Please try again later.' : 'Check your connection and try again.'}`
    };
  }
}

export function saveRecommendations(userId, data) {
  const payload = {
    data,
    generatedAt: new Date().toISOString(),
    userId,
  };
  localStorage.setItem(`ai_recommendations_${userId}`, JSON.stringify(payload));
}

export function getCachedRecommendations(userId) {
  const raw = localStorage.getItem(`ai_recommendations_${userId}`);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  const generatedAt = new Date(parsed.generatedAt);
  const now = new Date();
  const hoursDiff = (now - generatedAt) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    localStorage.removeItem(`ai_recommendations_${userId}`);
    return null;
  }

  return parsed.data;
}

export function clearRecommendationCache(userId) {
  localStorage.removeItem(`ai_recommendations_${userId}`);
}

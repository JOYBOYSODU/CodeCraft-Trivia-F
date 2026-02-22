import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client with API key from environment
const AI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!AI_API_KEY) {
  console.warn(
    "VITE_GEMINI_API_KEY is not set. Gemini service will not work. Please add it to your .env file."
  );
}

const ai = AI_API_KEY ? new GoogleGenAI({ apiKey: AI_API_KEY }) : null;

export const geminiService = {
  // Generate content using Gemini API
  generateContent: async (prompt, model = "gemini-2.5-flash") => {
    if (!ai) {
      throw new Error(
        "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file."
      );
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  // Generate recommendations (example specialized function)
  generateRecommendation: async (context) => {
    const prompt = `Based on the following context, provide helpful recommendations:\n${context}`;
    return geminiService.generateContent(prompt);
  },

  // Generate problem explanations
  explainProblem: async (problemStatement, difficulty) => {
    const prompt = `Explain this ${difficulty} programming problem in simple terms:\n${problemStatement}\n\nProvide a clear explanation and approach to solve it.`;
    return geminiService.generateContent(prompt);
  },

  // Generate hints for a problem
  getHint: async (problemStatement) => {
    const prompt = `Give a helpful hint (not the full solution) for this problem:\n${problemStatement}`;
    return geminiService.generateContent(prompt);
  },
};

export default geminiService;

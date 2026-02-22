import { useState } from "react";
import geminiService from "../services/geminiService";

/**
 * Hook to interact with Gemini AI
 * Usage:
 * const { loading, error, generateText } = useGemini();
 * const text = await generateText("Your prompt here");
 */
export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateText = async (prompt) => {
    setLoading(true);
    setError(null);

    try {
      const response = await geminiService.generateContent(prompt);
      return response;
    } catch (err) {
      const errorMessage = err.message || "Failed to generate content";
      setError(errorMessage);
      console.error("Gemini Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getHint = async (problemStatement) => {
    setLoading(true);
    setError(null);

    try {
      const hint = await geminiService.getHint(problemStatement);
      return hint;
    } catch (err) {
      const errorMessage = err.message || "Failed to generate hint";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const explainProblem = async (problemStatement, difficulty = "medium") => {
    setLoading(true);
    setError(null);

    try {
      const explanation = await geminiService.explainProblem(
        problemStatement,
        difficulty
      );
      return explanation;
    } catch (err) {
      const errorMessage = err.message || "Failed to explain problem";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, generateText, getHint, explainProblem };
};

export default useGemini;

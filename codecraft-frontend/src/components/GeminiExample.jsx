import { useState } from "react";
import useGemini from "../hooks/useGemini";

/**
 * Example component showing how to use Gemini AI service
 * For problem explanations, hints, and recommendations
 */
export function GeminiExample() {
  const { loading, error, generateText, getHint, explainProblem } = useGemini();
  const [response, setResponse] = useState("");

  const handleExplainProblem = async () => {
    try {
      const explanation = await explainProblem(
        "Given an array of integers, find the two numbers that add up to a target sum",
        "medium"
      );
      setResponse(explanation);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleGetHint = async () => {
    try {
      const hint = await getHint(
        "Given an array of integers, find the two numbers that add up to a target sum"
      );
      setResponse(hint);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleGenerateCustom = async () => {
    try {
      const result = await generateText(
        "Write a JavaScript function that checks if a string is a palindrome"
      );
      setResponse(result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Gemini AI Examples</h2>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleExplainProblem}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Explain Problem"}
        </button>

        <button
          onClick={handleGetHint}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Get Hint"}
        </button>

        <button
          onClick={handleGenerateCustom}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Generate Code"}
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {response && (
        <div className="p-4 bg-gray-100 rounded text-gray-800 whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}

export default GeminiExample;

# Gemini AI Integration Guide

## Setup ✅ Complete

The Gemini AI SDK has been installed and configured for your CommitArena Frontend application.

### What's been set up:

1. **@google/genai package** - Installed via npm
2. **geminiService** - Service module for Gemini API calls
3. **useGemini hook** - React hook for easy integration
4. **Environment variables** - Secure API key storage
5. **Example component** - Shows how to use the service

---

## Files Created

### 1. `src/services/geminiService.js`
Core service for Gemini API interactions.

**Available methods:**
- `generateContent(prompt, model)` - Send any prompt to Gemini
- `explainProblem(problemStatement, difficulty)` - Explain coding problems
- `getHint(problemStatement)` - Generate hints for problems
- `generateRecommendation(context)` - Generate personalized recommendations

### 2. `src/hooks/useGemini.js`
React hook with built-in loading and error states.

**Returns:**
- `loading` (boolean) - Request in progress
- `error` (string|null) - Error message if any
- `generateText(prompt)` - Generate content
- `getHint(problemStatement)` - Get hint
- `explainProblem(problemStatement, difficulty)` - Explain problem

### 3. `src/components/GeminiExample.jsx`
Example component showing usage patterns.

### 4. `.env`
Updated with `VITE_GEMINI_API_KEY` - your API key (kept in .gitignore)

### 5. `.env.example`
Template for sharing configuration without exposing secrets

### 6. `.gitignore`
Updated to never commit `.env` files

---

## Usage Examples

### In a React Component (Recommended)

```jsx
import { useGemini } from "../hooks/useGemini";

function MyComponent() {
  const { loading, error, explainProblem } = useGemini();

  const handleGetExplanation = async () => {
    try {
      const explanation = await explainProblem(
        "Implement binary search algorithm",
        "hard"
      );
      console.log(explanation);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <button onClick={handleGetExplanation} disabled={loading}>
      {loading ? "Generating..." : "Explain Problem"}
    </button>
  );
}
```

### Direct Service Usage

```javascript
import geminiService from "../services/geminiService";

// Simple content generation
const response = await geminiService.generateContent(
  "Explain how async/await works"
);

// Problem explanation
const explanation = await geminiService.explainProblem(
  "Two Sum: Find two numbers in array that add up to target",
  "easy"
);

// Get a hint
const hint = await geminiService.getHint("Fibonacci sequence implementation");
```

---

## Environment Variables

The API key is stored in `.env`:
```
VITE_GEMINI_API_KEY=AIzaSyAn-ilm4ZY2rnrQ7suYjXsPzZWvMtzgvqk
```

**Important Security Notes:**
- ❌ **Never commit** `.env` file to Git
- ❌ **Never expose** your API key in code
- ✅ **Use** `.env.example` for documentation
- ✅ **Add** `.env` to `.gitignore` (already done)

---

## Available Models

Default: `gemini-2.5-flash`

Other available models:
- `gemini-3-flash-preview`
- `gemini-1.5-pro`
- `gemini-1.5-flash`

You can specify the model when calling:
```javascript
const response = await geminiService.generateContent(
  "Your prompt",
  "gemini-1.5-pro"
);
```

---

## Error Handling

The hook automatically handles errors:

```jsx
const { error, loading, generateText } = useGemini();

if (error) {
  return <div className="error">{error}</div>;
}

if (loading) {
  return <div>Loading...</div>;
}
```

---

## Integration Examples

### 1. **Problem Description Helper** (Practice Page)
```jsx
const { explainProblem } = useGemini();
const explanation = await explainProblem(problem.statement, problem.difficulty);
```

### 2. **Hint System** (Contest Room)
```jsx
const { getHint } = useGemini();
const hint = await getHint(currentProblem.description);
```

### 3. **Recommendation Engine** (Dashboard)
```jsx
const { generateText } = useGemini();
const recommendation = await generateText(
  `Based on user stats: ${userStats}, suggest next practice topic`
);
```

---

## Troubleshooting

### "API key is not configured"
- Ensure `.env` file exists in project root
- Check `VITE_GEMINI_API_KEY` is set correctly
- Restart dev server after adding `.env`

### CORS Issues
- These happen when calling from frontend directly
- Consider adding API endpoint to backend that calls Gemini
- Backend can securely store the API key

### Rate Limiting
- Google has rate limits on Gemini API
- Implement caching/debouncing if needed
- Monitor usage in Google AI Studio dashboard

---

## Next Steps

1. ✅ Package installed
2. ✅ Service configured
3. ✅ Hook created
4. ✅ Environment variables set
5. **TODO:** Import `useGemini` in your components where you need AI features
6. **TODO:** Test with the example component
7. **TODO:** Consider backend integration for production

---

## Support

For more details:
- [Google Gemini API Docs](https://ai.google.dev/)
- [Gemini JS SDK Docs](https://github.com/google/generative-ai-js)
- Check the example component: `src/components/GeminiExample.jsx`

# Player Goals & Snapshot System - Frontend Implementation

## Overview

This implementation connects your frontend to backend player data services and intelligently generates personalized learning goals. The system includes three main components:

### 1. **Services** (`src/services/playerGoalService.js`)

#### API Endpoints Required from Backend

```javascript
// Get player snapshot by ID
GET /api/player/:userId/snapshot
// Returns: { id, name, level, tier, stats, context, ... }

// Get or calculate player goals
GET /api/player/:userId/goals
// Returns: { weeklyGoal, monthlyGoal, readyForDifficulty }

// Save/update player goals
POST /api/player/:userId/goals
// Body: { weeklyGoal, monthlyGoal, readyForDifficulty }

// Get player performance metrics
GET /api/player/:userId/performance
// Returns: { weakAreas, strengthAreas, recentSubmissions }
```

#### Goal Calculation Functions

- **`calculateWeeklyGoal(playerData, performance)`** - Intelligently sets weekly targets based on:
  - Player tier (Bronze: 2 problems, Silver: 3, Gold: 4, Platinum: 5)
  - Acceptance rate (struggles = reduce target, thriving = increase target)
  - Weak areas (focus on improvement areas)
  - Generates motivational messages

- **`calculateMonthlyGoal(playerData, performance)`** - Sets monthly targets:
  - 4x weekly goal (capped at 20 problems)
  - Determines difficulty progression (EASY → MEDIUM → HARD)
  - Based on solved problem counts

- **`calculateReadyDifficulty(stats)`** - Determines appropriate difficulty:
  - EASY: 3+ easy problems solved
  - MEDIUM: 10+ medium problems solved
  - HARD: 5+ hard problems solved

---

### 2. **Hooks**

#### `usePlayerSnapshot(userId)`

Fetches player snapshot data by user ID.

```javascript
import { usePlayerSnapshot } from '@/hooks/usePlayerSnapshot';

function MyComponent() {
  const { playerData, loading, error, refetch } = usePlayerSnapshot(userId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{playerData.name}</h1>
      <p>Level {playerData.level} - {playerData.tier}</p>
    </div>
  );
}
```

**Returns:**
- `playerData` - Full player snapshot object
- `loading` - Boolean loading state
- `error` - Error message if fetch fails
- `refetch()` - Function to manually refetch data

---

#### `usePlayerGoals(userId)` ⭐ **Main Hook**

Fetches player data, performance metrics, and intelligently calculates goals.

```javascript
import { usePlayerGoals } from '@/hooks/usePlayerGoals';

function AIRecommendationsPage() {
  const { 
    goals,           // { weeklyGoal, monthlyGoal, readyForDifficulty }
    playerData,      // Full player snapshot
    performance,     // { weakAreas, strengthAreas, ... }
    loading,         // Combined loading state
    error,           // Combined error message
    refetch,         // Refetch all data
    updateGoals      // Save updated goals
  } = usePlayerGoals(userId);

  const handleSaveGoals = async () => {
    const result = await updateGoals({
      weeklyGoal: { targetProblems: 5, focusTopic: 'Arrays' },
      monthlyGoal: { targetProblems: 20 }
    });
    
    if (result.success) console.log('Goals saved!');
  };

  return (
    <div>
      <h1>{playerData?.name}</h1>
      <p>Weekly Goal: {goals?.weeklyGoal?.targetProblems} problems</p>
      <button onClick={handleSaveGoals}>Update Goals</button>
    </div>
  );
}
```

**Returns:**
- `goals` - Calculated or fetched goals object
- `playerData` - Player snapshot from backend
- `performance` - Performance metrics (weak/strong areas)
- `loading` - Loading state
- `error` - Error message
- `refetch()` - Refetch all data
- `updateGoals(newGoals)` - Save new goals

---

#### `usePlayerGoalsOnly(userId)`

Lightweight alternative when you already have player data. Fetches only goals.

```javascript
const { goals, loading, error, updateGoals } = usePlayerGoalsOnly(userId);
```

---

### 3. **Updated Component: PracticePage.jsx**

The page now:

1. **Fetches real backend data** via `usePlayerGoals` hook
2. **Gets user ID** from `useAuth` context
3. **Merges backend goals** with AI recommendations
4. **Uses performance data** from backend (weak/strong areas)
5. **Handles loading & error states** from both sources
6. **Supports goal updates** when recommendations are regenerated

#### Key Changes:

```javascript
// OLD: localStorage fallback
const playerData = useMemo(() => readPlayerData(), []);

// NEW: Real backend data
const { playerData, goals, performance, loading, error, refetch } = usePlayerGoals(user?.id);
```

```javascript
// OLD: Isolated goals
<WeeklyGoalCard goal={recommendations.weeklyGoal} />

// NEW: Merged backend + AI goals
<WeeklyGoalCard goal={recommendations.weeklyGoal || goals?.weeklyGoal} />
```

---

## Usage Patterns

### Pattern 1: Full Integration (Recommended)

```javascript
import { usePlayerGoals } from '@/hooks';
import { useAuth } from '@/context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const { playerData, goals, performance, loading, error, updateGoals } = usePlayerGoals(user?.id);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <>
      <PlayerCard player={playerData} />
      <GoalsSection goals={goals} onUpdate={updateGoals} />
      <WeakAreasSection areas={performance.weakAreas} />
    </>
  );
}
```

### Pattern 2: Lightweight Goals Only

```javascript
import { usePlayerGoalsOnly } from '@/hooks';

function GoalsSidebar({ userId }) {
  const { goals, loading } = usePlayerGoalsOnly(userId);
  
  return (
    <div>
      {goals?.weeklyGoal && <WeeklyGoalCard goal={goals.weeklyGoal} />}
    </div>
  );
}
```

### Pattern 3: Manual Goal Calculation

```javascript
import { generateCompleteGoals } from '@/services/playerGoalService';

// If you have player data and performance data separately
const goals = generateCompleteGoals(playerSnapshot, performanceMetrics);
```

---

## Backend Dependencies

Your backend must provide these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/player/:userId/snapshot` | GET | Fetch complete player profile |
| `/api/player/:userId/goals` | GET | Fetch existing player goals |
| `/api/player/:userId/goals` | POST | Save/update player goals |
| `/api/player/:userId/performance` | GET | Fetch performance metrics |

### Response Schemas

#### **Player Snapshot**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "level": "number",
  "tier": "Bronze|Silver|Gold|Platinum",
  "subRank": "string",
  "xp": "number",
  "totalContests": "number",
  "preferredMode": "GRINDER|SPEEDRUNNER|...",
  "stats": {
    "totalSolved": "number",
    "easySolved": "number",
    "mediumSolved": "number",
    "hardSolved": "number",
    "acceptanceRate": "number (0-100)"
  },
  "context": {
    "questionsSolved": ["number"],
    "languagesUsed": ["string"],
    "favouriteTag": "string",
    "tagsExplored": ["string"]
  }
}
```

#### **Performance Metrics**
```json
{
  "weakAreas": ["Arrays", "Strings", "..."],
  "strengthAreas": ["Math", "Sorting", "..."],
  "recentSubmissions": [
    { "problemId": "number", "verdict": "ACCEPTED|...", "date": "ISO" }
  ]
}
```

#### **Goals**
```json
{
  "weeklyGoal": {
    "targetProblems": "number",
    "focusTopic": "string",
    "message": "string",
    "createdAt": "ISO"
  },
  "monthlyGoal": {
    "targetProblems": "number",
    "targetDifficulty": "EASY|MEDIUM|HARD",
    "message": "string"
  },
  "readyForDifficulty": "EASY|MEDIUM|HARD"
}
```

---

## Error Handling

All hooks include comprehensive error handling:

```javascript
const { goals, loading, error, refetch } = usePlayerGoals(userId);

if (error) {
  return (
    <ErrorBanner>
      <p>{error}</p>
      <button onClick={refetch}>Retry</button>
    </ErrorBanner>
  );
}
```

---

## Performance Optimizations

1. **Parallel API Calls** - Fetches snapshot + performance simultaneously
2. **Fallback Goals Calculation** - If goals endpoint fails, calculates from snapshot data
3. **Caching in PracticePage** - AI recommendations cached to reduce API calls
4. **Memo Hooks** - `usePlayerSnapshotMemo` prevents unnecessary re-renders

---

## Next Steps

1. ✅ Create backend endpoints as specified above
2. ✅ Test with Postman/Thunder Client
3. ✅ Update API URLs in `src/api/axiosInstance.js` if needed
4. ✅ Deploy and test with real player data

All frontend code is ready to consume your backend endpoints!

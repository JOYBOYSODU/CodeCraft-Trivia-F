# AI Recommendation System - User Flow Guide

## Complete Flow When You Login

### Step 1: Login as Player ✅
- Go to `/login`
- Enter player credentials
- Click "Sign In"

### Step 2: Welcome Modal Appears (First Time Only) 🎯
- **Automatically shows** when you successfully login for the first time
- Modal displays:
  - 🤖 "CommitArena Coach" branding
  - Welcome message with your player name
  - Info about AI-powered personalized roadmap
  - Two buttons: "View Roadmap" or "Later"
  - **No auto-dismiss** - stays until you click a button

**What happens next:**
- Click **"View Roadmap"** → Goes to `/practice` (recommended ✅)
- Click **"Later"** → Closes modal, you can navigate manually

### Step 3: Practice Page (Main AI Experience) 📚
Navigate to `/practice` via:
- **Option A:** Click "View Roadmap" from modal
- **Option B:** Click "Practice" in the sidebar
- **Option C:** Go directly to `http://localhost:5175/practice`

### Step 4: See the Full AI System 🎨

**Left Sidebar:**
- Player Summary Banner (with your level, tier, assessment)
- Weekly Goal Card (target problems, focus topic)
- Weak Areas (topics you haven't explored)
- Strengths (topics you've mastered)

**Main Content:**
- Problem Roadmap List (10 recommended problems in priority order)
- Each problem has:
  - Priority badge (HIGH/MEDIUM/LOW)
  - Difficulty level
  - AI reasoning for recommendation
  - Estimated time to solve
  - Skills you'll build

**Right Sidebar - CommitArena Mentor (AI Chatbot):**
- Professional chat interface
- Ask AI for:
  - Problem hints
  - Concept explanations
  - Code help
  - General advice
- Collapse/expand button to save space
- Full message history

---

## How to Test It

### Test 1: First Time Login ✅
```
1. Clear localStorage (or use private/incognito)
2. Login as player
3. Modal should appear automatically
4. Click "View Roadmap"
5. See full practice page with sidebar
```

### Test 2: Subsequent Logins ✅
```
1. Login again
2. Modal NOT shown (already seen)
3. Click "Practice" from sidebar
4. Full practice page loads
5. AI chatbot ready to use
```

### Test 3: AI Chatbot ✅
```
1. On Practice page
2. Look at right sidebar - "CommitArena Mentor"
3. Click in the text area
4. Type: "How do I solve the Two Sum problem?"
5. Click send or press Enter
6. AI responses appear in chat
```

### Test 4: Refresh Recommendations ✅
```
1. Click yellow "Refresh Recommendations" button (top right)
2. Confirm modal appears: "Regenerate recommendations?"
3. Click "Regenerate"
4. Loading state shows
5. New AI-generated recommendations appear
```

---

## Data Used

The system uses your player data:
- **Name**: Your player name
- **Level**: Your current level (1-100)
- **Tier & Rank**: Your rank (Bronze/Silver/Gold/etc)
- **Solved Problems**: Problems you've completed
- **Favorite Topic**: Your preferred algorithm topic
- **Tags Explored**: Topics you've studied
- **Languages Used**: Your coding languages

---

## Troubleshooting

**Modal not showing on first login?**
- Check if `ai_rec_seen_${userId}` exists in localStorage
- Clear it and login again

**Can't see chatbot?**
- Make sure you're viewing on desktop (not mobile viewport)
- Check if the right sidebar is hidden (responsive design)
- Try widening the window

**Chatbot not responding?**
- Check browser console for errors
- Verify VITE_GEMINI_API_KEY is in .env file
- Ensure internet connection is active

**Recommendations not loading?**
- Check if `geminiService` is initialized correctly
- Verify API key is valid
- Try clicking "Refresh Recommendations"

---

## Browser Session

**Current Dev Server Running At:**
- http://localhost:5175

**To Test:**
1. Open the link above
2. Navigate to Login page
3. Enter player credentials
4. After login, modal will appear
5. Click "View Roadmap"
6. Explore the practice page!


# 🧪 Testing Your Socket.IO Integration

## Quick Start

### 1. Start the Backend (Socket.IO Server)
```bash
# Make sure your backend is running on port 5000
# The backend should emit these events:
# - contest:{contestId}:leaderboard
# - contest:{contestId}:solve
# - contest:{contestId}:rank
# - contest:{contestId}:status
# - player:levelup
# - player:achievement
# - submission:{submissionId}:result
```

### 2. Start the Frontend
```bash
cd "d:\New folder (2)\CodeCraft-Frontend-\codecraft-frontend"
npm run dev
```

### 3. Open Contest Room
1. Navigate to a LIVE contest
2. Click "Join Contest"
3. You should see:
   - ✅ Green "Connected" indicator in the header
   - ✅ Live leaderboard updating automatically
   - ✅ Toast notifications when other players solve problems

---

## 🔍 What to Check

### Connection Status Indicator
**Location:** Contest Room header (next to contest status badge)

**Expected behavior:**
- 🟡 Yellow "Connecting..." when page loads
- 🟢 Green "Connected" after ~1 second
- 🔴 Red "Disconnected" if backend is down

### Live Leaderboard Updates
**Test:**
1. Open contest room in 2 browser tabs
2. Submit a solution in one tab
3. Watch the leaderboard update in BOTH tabs instantly (no refresh)

### Problem Solve Notifications
**Test:**
1. Have a friend (or second account) solve a problem
2. You should see a toast: `🎯 username solved Problem Title (+100 pts)`

### Rank Change Notifications
**Test:**
1. Submit a problem that boosts your rank
2. You should see: `📈 Rank changed: 5 → 3`

### Level-Up Notifications
**Test:**
1. Gain enough XP to level up
2. You should see toast with Sparkles icon: `Level Up! Reached SILVER tier!`

### Achievement Notifications
**Test:**
1. Unlock an achievement
2. You should see: `🏆 Achievement Unlocked!`

---

## 🐛 Troubleshooting

### Issue: Red "Disconnected" indicator

**Causes:**
- Backend Socket.IO server not running
- Backend running on wrong port
- CORS issues

**Fix:**
1. Check backend console for Socket.IO startup message
2. Verify backend is on `http://localhost:5000`
3. Check `.env` file has correct `VITE_API_BASE_URL=http://localhost:5000/api`
4. Check backend CORS allows `http://localhost:5173` (Vite dev server)

### Issue: No toast notifications

**Causes:**
- Backend not emitting events
- Event names don't match

**Fix:**
1. Open browser console and check for WebSocket logs
2. Verify backend event names match exactly:
   - `contest:${contestId}:solve` (not `contest-solve` or `contest.solve`)
3. Check backend code emits events to the correct room

### Issue: Leaderboard doesn't update

**Causes:**
- Backend not emitting `contest:${contestId}:leaderboard` event
- Leaderboard is frozen

**Fix:**
1. Check if `contest.leaderboard_frozen` is true
2. Verify backend emits event after each submission
3. Check event payload has `leaderboard` array

### Issue: Connection drops frequently

**Causes:**
- Backend crashes
- Network issues
- JWT token expired

**Fix:**
1. Check backend logs for errors
2. Verify JWT token is valid
3. Socket.IO auto-reconnects - wait a few seconds

---

## 📊 Browser Console Logs

### Expected Logs (Success)
```
[WebSocket] Connected to server
```

### Expected Logs (Error)
```
[WebSocket] Connection error: Error: timeout
[WebSocket] Disconnected: transport close
[WebSocket] Cannot subscribe - not connected
```

---

## 🎬 Demo Scenario

### Complete E2E Test

1. **Setup:**
   - Start backend on port 5000
   - Start frontend (`npm run dev`)
   - Create a LIVE contest with 2 problems

2. **Player 1 (You):**
   - Join the contest
   - Verify green "Connected" indicator
   - Keep the tab open

3. **Player 2 (Friend/Second Account):**
   - Join the same contest
   - Submit a solution to Problem A
   - See it get accepted

4. **Verify Player 1 sees:**
   - ✅ Toast notification: `🎯 Player2 solved Problem A (+100 pts)`
   - ✅ Leaderboard updates instantly (Player 2 appears)
   - ✅ No page refresh needed

5. **Player 1 submits:**
   - Submit solution to Problem A
   - Submit solution to Problem B
   - Watch rank change: `📈 Rank changed: 2 → 1`

6. **Test Reconnection:**
   - Stop the backend server
   - Verify red "Disconnected" indicator
   - Restart the backend
   - Verify green "Connected" indicator (auto-reconnect)

---

## 🧩 Backend Event Examples

Here's what your backend should emit:

### Problem Solve Event
```javascript
io.to(`contest:${contestId}`).emit(`contest:${contestId}:solve`, {
    username: 'john_doe',
    problemTitle: 'Two Sum',
    points: 100
});
```

### Leaderboard Update Event
```javascript
io.to(`contest:${contestId}`).emit(`contest:${contestId}:leaderboard`, {
    leaderboard: [
        { rank: 1, username: 'alice', score: 300, solves: 3 },
        { rank: 2, username: 'bob', score: 200, solves: 2 },
    ]
});
```

### Rank Change Event
```javascript
io.to(`user:${userId}`).emit(`contest:${contestId}:rank`, {
    username: 'alice',
    oldRank: 3,
    newRank: 1,
    change: 2
});
```

### Level-Up Event
```javascript
io.to(`user:${userId}`).emit('player:levelup', {
    newTier: 'SILVER',
    xpGained: 150,
    totalXP: 1500
});
```

### Achievement Event
```javascript
io.to(`user:${userId}`).emit('player:achievement', {
    title: 'Speed Demon',
    description: 'Solved 3 problems in under 10 minutes',
    badge: '⚡'
});
```

### Contest Status Event
```javascript
io.to(`contest:${contestId}`).emit(`contest:${contestId}:status`, {
    status: 'ENDED',
    message: 'Contest has concluded. Results are being calculated.'
});
```

---

## ✅ Success Criteria

Your Socket.IO integration is working correctly if:

- ✅ Connection indicator shows green "Connected"
- ✅ Leaderboard updates in real-time (no F5 needed)
- ✅ Toast notifications appear when events happen
- ✅ Multiple tabs stay synced
- ✅ Auto-reconnects after backend restart
- ✅ No console errors
- ✅ All 6+ event types working

---

## 🎉 You're All Set!

Your frontend now has:
- ✅ Socket.IO client (replaced STOMP)
- ✅ `useWebSocket()` hook
- ✅ `useContestWebSocket()` hook
- ✅ Live leaderboard updates
- ✅ Live notifications (6 types)
- ✅ Connection status indicator
- ✅ Auto-reconnection
- ✅ JWT authentication
- ✅ Room management (join/leave)

**No additional API endpoints needed!** Everything works through WebSocket events. 🚀

# 🔄 Socket.IO Integration Guide

## ✅ What's Been Updated

### 1. **socketService.js** - Replaced STOMP with Socket.IO
- ✅ Socket.IO client connection
- ✅ JWT authentication
- ✅ Auto-reconnection with exponential backoff
- ✅ 8 real-time event subscriptions ready
- ✅ Connection status tracking

### 2. **useWebSocket.js** - Custom React Hook
- ✅ `useWebSocket()` - Basic WebSocket connection hook
- ✅ `useContestWebSocket()` - Contest-specific hook with all live events
- ✅ Auto-connect/disconnect lifecycle management
- ✅ Connection status monitoring

### 3. **ContestRoom.jsx** - Live Contest Experience
- ✅ Live leaderboard updates (no refresh needed)
- ✅ Live problem solve notifications
- ✅ Live rank change alerts
- ✅ Level-up notifications
- ✅ Achievement unlock notifications
- ✅ Contest status change alerts
- ✅ WebSocket connection status indicator

---

## 🎯 Real-Time Events

### Backend Events (Your Socket.IO Server)

Your backend emits these 8 events:

1. **`contest:{contestId}:leaderboard`** - Leaderboard updates
   ```javascript
   { leaderboard: [...], timestamp: "2026-02-22T..." }
   ```

2. **`contest:{contestId}:solve`** - Problem solve notifications
   ```javascript
   { username: "john", problemTitle: "Two Sum", points: 100 }
   ```

3. **`contest:{contestId}:rank`** - Rank changes
   ```javascript
   { username: "john", oldRank: 5, newRank: 3, change: 2 }
   ```

4. **`contest:{contestId}:status`** - Contest status changes
   ```javascript
   { status: "LIVE" | "ENDED", message: "Contest started!" }
   ```

5. **`player:levelup`** - Level-up events
   ```javascript
   { newTier: "SILVER", xpGained: 150, totalXP: 1500 }
   ```

6. **`player:achievement`** - Achievement unlocks
   ```javascript
   { title: "Speed Demon", description: "...", badge: "🏃" }
   ```

7. **`submission:{submissionId}:result`** - Submission results
   ```javascript
   { verdict: "ACCEPTED", runtime: 125, memory: 1024 }
   ```

8. **Custom events** - Your backend can add more anytime

---

## 📚 Usage Examples

### Basic WebSocket Connection

```jsx
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
    const { status, isConnected, socketService } = useWebSocket();
    
    return (
        <div>
            Status: {status}
            {isConnected && <span>✅ Connected</span>}
        </div>
    );
}
```

### Contest Room with All Live Events

```jsx
import { useContestWebSocket } from '@/hooks/useWebSocket';

function ContestRoom() {
    const contestId = 123;
    
    const { status, isConnected } = useContestWebSocket(contestId, {
        onLeaderboardUpdate: (data) => {
            setLeaderboard(data.leaderboard);
        },
        
        onProblemSolve: (data) => {
            toast.success(`${data.username} solved ${data.problemTitle}!`);
        },
        
        onRankChange: (data) => {
            if (data.username === currentUser.username) {
                toast.info(`Rank: ${data.oldRank} → ${data.newRank}`);
            }
        },
        
        onLevelUp: (data) => {
            toast.success(`Level up! Reached ${data.newTier}`);
        },
        
        onAchievement: (data) => {
            toast.success(`Achievement unlocked: ${data.title}`);
        },
        
        onStatusChange: (data) => {
            setContestStatus(data.status);
        },
    });
    
    return <div>...</div>;
}
```

### Manual Event Subscription

```jsx
import { socketService } from '@/services/socketService';
import { useAuth } from '@/context/AuthContext';

function CustomComponent() {
    const { token } = useAuth();
    
    useEffect(() => {
        // Connect
        socketService.connect(token, 
            () => console.log('Connected'),
            (err) => console.error(err)
        );
        
        // Subscribe to custom event
        const unsubscribe = socketService.on('custom:event', (data) => {
            console.log('Received:', data);
        });
        
        // Cleanup
        return () => {
            unsubscribe();
            socketService.disconnect();
        };
    }, [token]);
}
```

---

## 🔌 Connection Status Indicator

Use the `ConnectionStatus` component to show WebSocket status:

```jsx
import ConnectionStatus from '@/components/ConnectionStatus';

function Header() {
    const { status } = useWebSocket();
    
    return (
        <div>
            <ConnectionStatus status={status} showLabel size="md" />
        </div>
    );
}
```

**Status values:**
- `'connected'` - Green pulsing dot
- `'connecting'` - Yellow spinning icon
- `'disconnected'` - Red static dot

---

## 🚀 Backend Requirements

### Socket.IO Server Setup (Port 5000)

Your backend should:
1. ✅ Run Socket.IO server on port 5000
2. ✅ Accept JWT token in `auth.token` during handshake
3. ✅ Emit events with proper naming conventions
4. ✅ Handle `contest:join` and `contest:leave` events from clients

### Example Backend Event Emission

```javascript
// When player solves a problem
io.to(`contest:${contestId}`).emit(`contest:${contestId}:solve`, {
    username: player.username,
    problemTitle: problem.title,
    points: problem.points
});

// When leaderboard updates
io.to(`contest:${contestId}`).emit(`contest:${contestId}:leaderboard`, {
    leaderboard: updatedLeaderboard,
    timestamp: new Date().toISOString()
});

// When player levels up
io.to(`user:${userId}`).emit('player:levelup', {
    newTier: 'SILVER',
    xpGained: 150,
    totalXP: 1500
});
```

---

## 🎨 Toast Notifications

All live events show toast notifications using `react-hot-toast`:

- **Problem Solve:** `🎯 username solved Problem (+100 pts)` (green)
- **Rank Change:** `📈 Rank changed: 5 → 3` (blue/red)
- **Level Up:** `✨ Level Up! Reached SILVER tier!` (yellow)
- **Achievement:** `🏆 Achievement Unlocked!` (green)
- **Status Change:** `Contest is now LIVE!` (blue)

---

## 🔧 Configuration

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The WebSocket URL is automatically derived from `VITE_API_BASE_URL` by removing `/api`.

### Authentication

JWT token is automatically sent with every WebSocket connection from `AuthContext`.

---

## 🐛 Debugging

### Check Connection Status

```javascript
import { socketService } from '@/services/socketService';

// Check if connected
console.log(socketService.isConnected()); // true/false

// Get status
console.log(socketService.getStatus()); // 'connected'|'connecting'|'disconnected'
```

### View All Active Subscriptions

Open browser console and look for:
- `[WebSocket] Connected to server`
- `[WebSocket] Disconnected: reason`
- `[WebSocket] Connection error: ...`

### Monitor Events in Dev Tools

```javascript
// Subscribe to all events for debugging
socketService.on('*', (event, data) => {
    console.log('[WebSocket Event]', event, data);
});
```

---

## ✅ Testing Checklist

### 1. Connection Test
- [ ] Open ContestRoom page
- [ ] Check console for "Connected to server"
- [ ] See green connection indicator

### 2. Leaderboard Test
- [ ] Submit a problem solution
- [ ] Leaderboard updates instantly (no refresh)
- [ ] See your rank change animation

### 3. Notifications Test
- [ ] Have another player solve a problem
- [ ] See toast notification appear
- [ ] Check notification content is correct

### 4. Reconnection Test
- [ ] Stop backend server
- [ ] See red "disconnected" indicator
- [ ] Restart backend
- [ ] See green "connected" indicator (auto-reconnect)

### 5. Multi-tab Test
- [ ] Open ContestRoom in 2 tabs
- [ ] Submit in one tab
- [ ] See update in both tabs instantly

---

## 🎉 What Works Now

| Feature | Before | After |
|---------|--------|-------|
| Leaderboard | Manual refresh | ✅ Live updates |
| Problem solves | Not visible | ✅ Live notifications |
| Rank changes | Not tracked | ✅ Live alerts |
| Level-ups | Not shown | ✅ Toast notifications |
| Achievements | Not shown | ✅ Toast notifications |
| Connection status | Unknown | ✅ Live indicator |
| Contest status | Manual check | ✅ Live updates |

---

## 🔮 Future Enhancements

You can easily add more real-time features:

### Live Submission Results
```jsx
// In Problem.jsx
const unsubscribe = socketService.subscribeToSubmission(
    submissionId,
    (result) => {
        setVerdict(result.verdict);
        toast.success(`Verdict: ${result.verdict}`);
    }
);
```

### Live Chat
```jsx
socketService.on(`contest:${contestId}:chat`, (message) => {
    addMessageToChat(message);
});
```

### Live Announcements
```jsx
socketService.on('admin:announcement', (data) => {
    toast.info(data.message);
});
```

---

**Everything is ready! Your frontend now has full Socket.IO integration! 🚀**

# CodeCraft Frontend - Reusable Components Guide

## 📦 Component Library

All components are now available for use across the application. Import them easily:

```javascript
import { 
  TierBadge, 
  VerdictBadge, 
  CountdownTimer, 
  XPProgressBar,
  ConfirmationModal,
  Skeleton,
  EmptyState
} from '@/components';
```

---

## 🏷️ Badge Components

### TierBadge
Display player tier (Bronze/Silver/Gold) with icons.

```jsx
<TierBadge tier="GOLD" size="M" showIcon={true} />
```

**Props:**
- `tier`: `'BRONZE'` | `'SILVER'` | `'GOLD'`
- `size`: `'S'` | `'M'` | `'L'` (default: `'M'`)
- `showIcon`: `boolean` (default: `true`)

---

### VerdictBadge
Display submission verdict with color coding.

```jsx
<VerdictBadge verdict="ACCEPTED" size="sm" showIcon={true} />
```

**Props:**
- `verdict`: `'ACCEPTED'` | `'WRONG_ANSWER'` | `'TIME_LIMIT_EXCEEDED'` | `'RUNTIME_ERROR'` | `'COMPILATION_ERROR'` | `'MEMORY_LIMIT_EXCEEDED'`
- `size`: `'sm'` | `'md'` (default: `'sm'`)
- `showIcon`: `boolean` (default: `true`)

**Colors:**
- ✅ ACCEPTED: Green
- ❌ WRONG_ANSWER: Red
- ⏱️ TIME_LIMIT_EXCEEDED: Orange
- ⚠️ RUNTIME_ERROR: Purple
- 💻 COMPILATION_ERROR: Yellow
- 💾 MEMORY_LIMIT_EXCEEDED: Pink

---

### DifficultyBadge
Display problem difficulty level.

```jsx
<DifficultyBadge difficulty="HARD" size="md" />
```

**Props:**
- `difficulty`: `'EASY'` | `'MEDIUM'` | `'HARD'`
- `size`: `'sm'` | `'md'` (default: `'sm'`)

---

### ContestStatusBadge
Display contest status with animated dot for live contests.

```jsx
<ContestStatusBadge status="LIVE" showDot={true} size="sm" />
```

**Props:**
- `status`: `'DRAFT'` | `'UPCOMING'` | `'LIVE'` | `'ENDED'` | `'CANCELLED'`
- `showDot`: `boolean` (default: `true`)
- `size`: `'sm'` | `'md'` (default: `'sm'`)

**Note:** "LIVE" status has animated pulsing dot.

---

### ModeBadge
Display player mode (Precision/Grinder/Legend).

```jsx
<ModeBadge mode="LEGEND" showIcon={true} size="sm" />
```

**Props:**
- `mode`: `'PRECISION'` | `'GRINDER'` | `'LEGEND'`
- `showIcon`: `boolean` (default: `true`)
- `size`: `'sm'` | `'md'` (default: `'sm'`)

---

## ⏱️ CountdownTimer
Real-time countdown with color states based on time remaining.

```jsx
<CountdownTimer 
  endTime="2026-03-01T12:00:00Z" 
  onComplete={() => console.log('Contest ended!')}
  className="text-2xl"
/>
```

**Props:**
- `endTime`: ISO string or Date object
- `onComplete`: Callback when timer reaches 00:00:00
- `className`: Additional CSS classes

**Color States:**
- 🔴 Red: < 5 minutes remaining
- 🟡 Yellow: < 30 minutes remaining
- ⚪ Normal: > 30 minutes remaining

**Format:** `HH:MM:SS`

---

## 📊 XPProgressBar
Segmented progress bar showing Bronze/Silver/Gold tier progression.

```jsx
<XPProgressBar currentXP={1500} size="md" showLabel={true} />
```

**Props:**
- `currentXP`: Current experience points (0-10000)
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `showLabel`: Show tier name and XP info (default: `true`)

**Tier Ranges:**
- Bronze: 0 - 1000 XP
- Silver: 1000 - 3000 XP
- Gold: 3000+ XP

---

## ✅ ConfirmationModal
Reusable confirmation dialog with variants.

```jsx
const [showModal, setShowModal] = useState(false);

<ConfirmationModal
  isOpen={showModal}
  onConfirm={() => {
    deleteItem();
    setShowModal(false);
  }}
  onCancel={() => setShowModal(false)}
  title="Delete Problem"
  message="Are you sure you want to delete this problem? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
/>
```

**Props:**
- `isOpen`: `boolean` (required)
- `onConfirm`: Callback when confirmed
- `onCancel`: Callback when cancelled
- `title`: Modal heading (default: `'Confirm Action'`)
- `message`: Confirmation message (default: generic)
- `confirmText`: Text for confirm button (default: `'Confirm'`)
- `cancelText`: Text for cancel button (default: `'Cancel'`)
- `variant`: `'danger'` | `'warning'` | `'info'` (default: `'danger'`)

---

## 💀 Skeleton
Loading placeholders with shimmer effect.

```jsx
// Card skeleton
<Skeleton variant="card" />

// Table skeleton
<Skeleton variant="table" rows={5} cols={4} />

// Text skeleton
<Skeleton variant="text" lines={3} />

// Avatar skeleton
<Skeleton variant="avatar" size="md" />
```

**Variants:**
- `card`: Full card placeholder
- `table`: Table with headers and rows
- `text`: Multiple text lines
- `avatar`: Circular avatar

**Props:**
- `variant`: `'card'` | `'table'` | `'text'` | `'avatar'`
- `rows`: Number of table rows (for `table` variant)
- `cols`: Number of table columns (for `table` variant)
- `lines`: Number of text lines (for `text` variant)
- `size`: `'sm'` | `'md'` | `'lg'` (for `avatar` variant)

---

## 📭 EmptyState
Empty state with icon, message, and optional action button.

```jsx
<EmptyState 
  variant="noProblems"
  onAction={() => navigate('/admin/create-problem')}
/>

// Or custom:
<EmptyState
  customIcon={Inbox}
  customTitle="No data available"
  customMessage="Start by adding your first item."
  customAction="Add Item"
  onAction={() => handleAdd()}
/>
```

**Built-in Variants:**
- `noProblems`
- `noContests`
- `noResults`
- `noSubmissions`
- `noUsers`
- `default`

**Props:**
- `variant`: Pre-defined empty state type
- `onAction`: Callback for action button
- `customIcon`: Custom Lucide icon component
- `customTitle`: Custom title text
- `customMessage`: Custom message text
- `customAction`: Custom action button text

---

## 📡 WebSocket Integration

### Setup WebSocket Connection

```jsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import wsService from '@/services/socketService';

function ContestArena({ contestId }) {
  const { user, token } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Connect
    wsService.connect(token);

    // Subscribe to leaderboard updates
    wsService.subscribeToLeaderboard(contestId, (data) => {
      setLeaderboard(data.leaderboard);
    });

    // Subscribe to level-up notifications
    wsService.subscribeToLevelUp(user.id, (data) => {
      toast.success(`Level up! You reached ${data.newTier}!`);
    });

    // Cleanup
    return () => {
      wsService.unsubscribeFromLeaderboard(contestId);
      wsService.unsubscribeFromLevelUp(user.id);
      wsService.disconnect();
    };
  }, [contestId, user.id, token]);

  return <div>{/* Your component */}</div>;
}
```

### Available WebSocket Methods

```javascript
// Connection
await wsService.connect(token);
wsService.disconnect();
const isConnected = wsService.getConnectionStatus();

// Leaderboard (auto-updates)
wsService.subscribeToLeaderboard(contestId, callback);
wsService.unsubscribeFromLeaderboard(contestId);

// Level-up notifications
wsService.subscribeToLevelUp(userId, callback);
wsService.unsubscribeFromLevelUp(userId);

// Contest status changes
wsService.subscribeToContestStatus(contestId, callback);
wsService.unsubscribeFromContestStatus(contestId);

// Manual subscription
wsService.subscribe('/topic/custom', callback);
wsService.unsubscribe('/topic/custom');

// Send message
wsService.send('/app/endpoint', { data });
```

---

## 🔌 ConnectionStatus
Visual indicator for WebSocket connection state.

```jsx
<ConnectionStatus status="connected" showLabel={true} size="md" />
```

**Props:**
- `status`: `'connected'` | `'connecting'` | `'disconnected'`
- `showLabel`: Show text label (default: `false`)
- `size`: `'sm'` | `'md'` (default: `'sm'`)

**States:**
- 🟢 Connected: Green pulsing dot
- 🟡 Connecting: Yellow with spinning icon
- 🔴 Disconnected: Red static dot

---

## 📦 SlideDrawer
Right-side drawer panel for forms/details.

```jsx
const [isOpen, setIsOpen] = useState(false);

<SlideDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Problem Details"
  width="md"
>
  <div>
    <h3>Description</h3>
    <p>Your content here...</p>
  </div>
</SlideDrawer>
```

**Props:**
- `isOpen`: `boolean` (required)
- `onClose`: Callback to close drawer
- `title`: Drawer heading
- `width`: `'sm'` | `'md'` | `'lg'` | `'full'` (default: `'md'`)
- `children`: Drawer content

---

## 🎨 Usage Examples

### Contest Card with Badges

```jsx
function ContestCard({ contest }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <h3>{contest.title}</h3>
        <ContestStatusBadge status={contest.status} />
      </div>
      
      <p>{contest.description}</p>
      
      <div className="flex gap-2 mt-4">
        <DifficultyBadge difficulty={contest.difficulty} />
        <ModeBadge mode={contest.mode} />
      </div>
      
      {contest.status === 'LIVE' && (
        <CountdownTimer 
          endTime={contest.end_time}
          onComplete={() => refetchContest()}
        />
      )}
    </div>
  );
}
```

### Problem List with Empty State

```jsx
function ProblemList({ problems, loading }) {
  if (loading) {
    return <Skeleton variant="table" rows={5} cols={4} />;
  }

  if (problems.length === 0) {
    return (
      <EmptyState 
        variant="noProblems"
        onAction={() => navigate('/admin/create-problem')}
      />
    );
  }

  return (
    <table>
      {problems.map(problem => (
        <tr key={problem.id}>
          <td>{problem.title}</td>
          <td><DifficultyBadge difficulty={problem.difficulty} /></td>
          <td>{problem.points} pts</td>
        </tr>
      ))}
    </table>
  );
}
```

### Submission History with Verdicts

```jsx
function SubmissionHistory({ submissions }) {
  return (
    <div>
      {submissions.map(sub => (
        <div key={sub.id} className="flex items-center gap-3">
          <span>{sub.problem_title}</span>
          <VerdictBadge verdict={sub.verdict} />
          <span className="text-slate-500 text-sm">
            {new Date(sub.submitted_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 Notes

- All badge components use the **yellow (#F7E800)** primary theme color where applicable
- Skeleton components have automatic shimmer animation
- WebSocket auto-reconnects with exponential backoff (max 5 attempts)
- CountdownTimer updates every second
- XPProgressBar has smooth transitions
- All modals support ESC key to close
- Drawers lock body scroll when open

---

## 🚀 Next Steps

1. ✅ All reusable components created
2. ✅ WebSocket service with STOMP/SockJS ready
3. ✅ 401 redirect interceptor active
4. ✅ Navbar with avatar dropdown
5. ✅ Sidebar with active link highlights
6. ✅ Connection status indicator
7. ✅ Slide drawer component

**Ready to use in:**
- Contest arena pages
- Problem submission pages
- Leaderboards
- Admin dashboards
- Player profiles

See `src/examples/WebSocketExamples.jsx` for complete integration patterns.

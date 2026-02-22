/**
 * WebSocket Integration Example
 * 
 * This file demonstrates how to integrate WebSocket connections
 * in contest arena and leaderboard components.
 * 
 * Copy the patterns below into your actual components.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import wsService from '../services/socketService';
import ConnectionStatus from '../components/ConnectionStatus';

// ============================================================
// EXAMPLE 1: Contest Arena Component with WebSocket
// ============================================================

export function ContestArenaExample({ contestId }) {
  const { user, token } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [leaderboard, setLeaderboard] = useState([]);
  const [levelUpNotification, setLevelUpNotification] = useState(null);

  useEffect(() => {
    // Connect to WebSocket when entering contest arena
    const connectWebSocket = async () => {
      try {
        setConnectionStatus('connecting');
        await wsService.connect(token);
        setConnectionStatus('connected');

        // Subscribe to leaderboard updates
        wsService.subscribeToLeaderboard(contestId, (data) => {
          console.log('📊 Leaderboard updated:', data);
          setLeaderboard(data.leaderboard || []);
        });

        // Subscribe to level-up notifications
        wsService.subscribeToLevelUp(user.id, (data) => {
          console.log('🎉 Level up!', data);
          setLevelUpNotification(data);
          
          // Auto-dismiss after 5 seconds
          setTimeout(() => setLevelUpNotification(null), 5000);
        });

        // Subscribe to contest status changes
        wsService.subscribeToContestStatus(contestId, (data) => {
          console.log('📢 Contest status changed:', data);
          if (data.status === 'ENDED') {
            alert('Contest has ended!');
          }
        });

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('disconnected');
      }
    };

    connectWebSocket();

    // Cleanup: Disconnect when leaving arena
    return () => {
      wsService.unsubscribeFromLeaderboard(contestId);
      wsService.unsubscribeFromLevelUp(user.id);
      wsService.unsubscribeFromContestStatus(contestId);
      wsService.disconnect();
      setConnectionStatus('disconnected');
    };
  }, [contestId, user.id, token]);

  return (
    <div>
      {/* Connection Status Indicator */}
      <div className="fixed top-20 right-4 z-50">
        <ConnectionStatus status={connectionStatus} showLabel size="md" />
      </div>

      {/* Level Up Notification */}
      {levelUpNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-slide-in">
          <h3 className="font-bold">🎉 Level Up!</h3>
          <p>You reached {levelUpNotification.newTier}!</p>
          <p>+{levelUpNotification.xpGained} XP</p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="mt-4">
        <h2>Live Leaderboard</h2>
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={entry.userId}>
              #{index + 1} - {entry.username} - {entry.score} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// EXAMPLE 2: Standalone Leaderboard Component
// ============================================================

export function LiveLeaderboardExample({ contestId }) {
  const { token } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const setupLeaderboard = async () => {
      try {
        await wsService.connect(token);
        setIsConnected(true);

        wsService.subscribeToLeaderboard(contestId, (data) => {
          setLeaderboard(data.leaderboard || []);
        });
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setIsConnected(false);
      }
    };

    setupLeaderboard();

    return () => {
      wsService.unsubscribeFromLeaderboard(contestId);
    };
  }, [contestId, token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Leaderboard</h2>
        <ConnectionStatus status={isConnected ? 'connected' : 'disconnected'} />
      </div>

      {leaderboard.length === 0 ? (
        <p>No submissions yet...</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr key={entry.userId}>
                <td>#{idx + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                <td>{entry.problemsSolved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ============================================================
// EXAMPLE 3: Player Profile with Level Notifications
// ============================================================

export function PlayerProfileWithNotifications({ userId }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const setupNotifications = async () => {
      await wsService.connect(token);

      wsService.subscribeToLevelUp(userId, (data) => {
        const notification = {
          id: Date.now(),
          type: 'levelup',
          message: `You've reached ${data.newTier} tier!`,
          xp: data.xpGained,
          timestamp: new Date()
        };

        setNotifications(prev => [notification, ...prev].slice(0, 5));
      });
    };

    setupNotifications();

    return () => {
      wsService.unsubscribeFromLevelUp(userId);
    };
  }, [userId, token]);

  return (
    <div>
      <h3>Recent Achievements</h3>
      <ul>
        {notifications.map(notif => (
          <li key={notif.id}>
            {notif.message} (+{notif.xp} XP)
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// EXAMPLE 4: Manual WebSocket Usage (Advanced)
// ============================================================

export function ManualWebSocketExample() {
  const { token } = useAuth();

  const handleConnect = async () => {
    try {
      await wsService.connect(token);
      console.log('Connected!');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleSubscribe = () => {
    wsService.subscribe('/topic/custom/channel', (data) => {
      console.log('Received:', data);
    });
  };

  const handleSend = () => {
    wsService.send('/app/custom/endpoint', { 
      message: 'Hello from client!' 
    });
  };

  const handleDisconnect = () => {
    wsService.disconnect();
    console.log('Disconnected');
  };

  return (
    <div className="space-y-2">
      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleSubscribe}>Subscribe to Custom Channel</button>
      <button onClick={handleSend}>Send Message</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      
      <p>Status: {wsService.getConnectionStatus() ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}

// ============================================================
// KEY USAGE PATTERNS:
// ============================================================

/*

1. CONNECT when entering contest/arena:
   await wsService.connect(token);

2. SUBSCRIBE to topics:
   wsService.subscribeToLeaderboard(contestId, callback);
   wsService.subscribeToLevelUp(userId, callback);
   wsService.subscribeToContestStatus(contestId, callback);

3. UNSUBSCRIBE when leaving:
   wsService.unsubscribeFromLeaderboard(contestId);
   wsService.unsubscribeFromLevelUp(userId);

4. DISCONNECT when done:
   wsService.disconnect();

5. CHECK connection status:
   const isConnected = wsService.getConnectionStatus();

6. SEND messages (optional):
   wsService.send('/app/endpoint', { data });

*/

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing WebSocket connections
 * @param {object} options - Configuration options
 * @param {number} options.contestId - Contest ID to join
 * @param {boolean} options.autoConnect - Auto-connect on mount (default: true)
 * @returns {object} WebSocket utilities
 */
export function useWebSocket({ contestId, autoConnect = true } = {}) {
    const { token } = useAuth();
    const [status, setStatus] = useState('disconnected');
    const [error, setError] = useState(null);
    const contestIdRef = useRef(contestId);

    // Update ref when contestId changes
    useEffect(() => {
        contestIdRef.current = contestId;
    }, [contestId]);

    // Auto-connect on mount
    useEffect(() => {
        if (!autoConnect || !token) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus('connecting');
        socketService.connect(
            token,
            () => {
                setStatus('connected');
                setError(null);

                // Join contest room if contestId provided
                if (contestIdRef.current) {
                    socketService.joinContest(contestIdRef.current);
                }
            },
            (err) => {
                setStatus('disconnected');
                setError(err.message || 'Connection failed');
            }
        );

        return () => {
            if (contestIdRef.current) {
                socketService.leaveContest(contestIdRef.current);
            }
            socketService.disconnect();
            setStatus('disconnected');
        };
    }, [autoConnect, token]);

    // Manual connect function
    const connect = useCallback(() => {
        if (!token) {
            setError('No authentication token');
            return;
        }

        setStatus('connecting');
        socketService.connect(
            token,
            () => {
                setStatus('connected');
                setError(null);

                if (contestIdRef.current) {
                    socketService.joinContest(contestIdRef.current);
                }
            },
            (err) => {
                setStatus('disconnected');
                setError(err.message || 'Connection failed');
            }
        );
    }, [token]);

    // Manual disconnect function
    const disconnect = useCallback(() => {
        if (contestIdRef.current) {
            socketService.leaveContest(contestIdRef.current);
        }
        socketService.disconnect();
        setStatus('disconnected');
    }, []);

    return {
        status,
        error,
        isConnected: status === 'connected',
        connect,
        disconnect,
        socketService, // Expose service for manual event subscriptions
    };
}

/**
 * Hook specifically for contest rooms with all live events
 * @param {number} contestId - Contest ID
 * @param {object} handlers - Event handlers
 * @returns {object} WebSocket utilities
 */
export function useContestWebSocket(contestId, handlers = {}) {
    const ws = useWebSocket({ contestId });

    useEffect(() => {
        if (!ws.isConnected) return;

        const unsubscribers = [];

        // Leaderboard updates
        if (handlers.onLeaderboardUpdate) {
            const unsub = socketService.subscribeToLeaderboard(
                contestId,
                handlers.onLeaderboardUpdate
            );
            unsubscribers.push(unsub);
        }

        // Problem solve notifications
        if (handlers.onProblemSolve) {
            const unsub = socketService.subscribeToProblemSolves(
                contestId,
                handlers.onProblemSolve
            );
            unsubscribers.push(unsub);
        }

        // Rank changes
        if (handlers.onRankChange) {
            const unsub = socketService.subscribeToRankChanges(
                contestId,
                handlers.onRankChange
            );
            unsubscribers.push(unsub);
        }

        // Contest status changes
        if (handlers.onStatusChange) {
            const unsub = socketService.subscribeToContestStatus(
                contestId,
                handlers.onStatusChange
            );
            unsubscribers.push(unsub);
        }

        // Level-up notifications
        if (handlers.onLevelUp) {
            const unsub = socketService.subscribeToLevelUp(
                handlers.onLevelUp
            );
            unsubscribers.push(unsub);
        }

        // Achievement unlocks
        if (handlers.onAchievement) {
            const unsub = socketService.subscribeToAchievements(
                handlers.onAchievement
            );
            unsubscribers.push(unsub);
        }

        // Cleanup all subscriptions
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [ws.isConnected, contestId, handlers]);

    return ws;
}

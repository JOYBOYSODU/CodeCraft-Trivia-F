import { io } from "socket.io-client";

let socket = null;
let connectionStatus = 'disconnected'; // 'disconnected', 'connecting', 'connected'
const eventHandlers = new Map();

export const socketService = {
    /**
     * Connect to Socket.IO server
     * @param {string} token - JWT authentication token
     * @param {function} onConnected - Callback when connected
     * @param {function} onError - Callback on error
     */
    connect(token, onConnected, onError) {
        if (socket?.connected) {
            if (onConnected) onConnected();
            return socket;
        }

        connectionStatus = 'connecting';

        // Extract base URL from VITE_API_BASE_URL (remove /api suffix)
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

        socket = io(baseUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        socket.on('connect', () => {
            connectionStatus = 'connected';
            console.log('[WebSocket] Connected to server');
            if (onConnected) onConnected();
        });

        socket.on('disconnect', (reason) => {
            connectionStatus = 'disconnected';
            console.log('[WebSocket] Disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            connectionStatus = 'disconnected';
            console.error('[WebSocket] Connection error:', error);
            if (onError) onError(error);
        });

        return socket;
    },

    /**
     * Disconnect from Socket.IO server
     */
    disconnect() {
        if (socket) {
            eventHandlers.clear();
            socket.disconnect();
            socket = null;
            connectionStatus = 'disconnected';
        }
    },

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Event handler
     * @returns {function} Unsubscribe function
     */
    on(event, callback) {
        if (!socket) {
            console.warn('[WebSocket] Cannot subscribe - not connected');
            return () => {};
        }

        // Store handler for cleanup
        if (!eventHandlers.has(event)) {
            eventHandlers.set(event, new Set());
        }
        eventHandlers.get(event).add(callback);

        socket.on(event, callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Event handler to remove
     */
    off(event, callback) {
        if (socket) {
            socket.off(event, callback);
        }
        if (eventHandlers.has(event)) {
            eventHandlers.get(event).delete(callback);
        }
    },

    /**
     * Emit an event to the server
     * @param {string} event - Event name
     * @param {any} data - Data to send
     */
    emit(event, data) {
        if (socket?.connected) {
            socket.emit(event, data);
        } else {
            console.warn('[WebSocket] Cannot emit - not connected');
        }
    },

    /**
     * Get current connection status
     * @returns {string} 'connected', 'connecting', or 'disconnected'
     */
    getStatus() {
        return connectionStatus;
    },

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return socket?.connected ?? false;
    },

    // ============ CONTEST-SPECIFIC EVENTS ============

    /**
     * Subscribe to leaderboard updates
     * @param {number} contestId - Contest ID
     * @param {function} callback - Handler for leaderboard data
     */
    subscribeToLeaderboard(contestId, callback) {
        return this.on(`contest:${contestId}:leaderboard`, callback);
    },

    /**
     * Subscribe to problem solve notifications
     * @param {number} contestId - Contest ID
     * @param {function} callback - Handler for solve events
     */
    subscribeToProblemSolves(contestId, callback) {
        return this.on(`contest:${contestId}:solve`, callback);
    },

    /**
     * Subscribe to rank change notifications
     * @param {number} contestId - Contest ID
     * @param {function} callback - Handler for rank changes
     */
    subscribeToRankChanges(contestId, callback) {
        return this.on(`contest:${contestId}:rank`, callback);
    },

    /**
     * Subscribe to level-up notifications
     * @param {function} callback - Handler for level-up events
     */
    subscribeToLevelUp(callback) {
        return this.on('player:levelup', callback);
    },

    /**
     * Subscribe to achievement unlocks
     * @param {function} callback - Handler for achievement events
     */
    subscribeToAchievements(callback) {
        return this.on('player:achievement', callback);
    },

    /**
     * Subscribe to contest status changes
     * @param {number} contestId - Contest ID
     * @param {function} callback - Handler for status changes
     */
    subscribeToContestStatus(contestId, callback) {
        return this.on(`contest:${contestId}:status`, callback);
    },

    /**
     * Subscribe to submission results
     * @param {number} submissionId - Submission ID
     * @param {function} callback - Handler for submission updates
     */
    subscribeToSubmission(submissionId, callback) {
        return this.on(`submission:${submissionId}:result`, callback);
    },

    /**
     * Join a contest room (notify server)
     * @param {number} contestId - Contest ID
     */
    joinContest(contestId) {
        this.emit('contest:join', { contestId });
    },

    /**
     * Leave a contest room (notify server)
     * @param {number} contestId - Contest ID
     */
    leaveContest(contestId) {
        this.emit('contest:leave', { contestId });
    },
};

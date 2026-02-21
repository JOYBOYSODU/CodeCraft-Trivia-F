import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
const subscriptions = {};

export const socketService = {
    connect(token, onConnected, onError) {
        if (stompClient?.connected) return;

        stompClient = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            reconnectDelay: 5000,
            onConnect: () => {
                if (onConnected) onConnected();
            },
            onStompError: (frame) => {
                if (onError) onError(frame);
            },
            onDisconnect: () => { },
        });

        stompClient.activate();
    },

    disconnect() {
        if (stompClient) {
            stompClient.deactivate();
            stompClient = null;
        }
    },

    subscribe(topic, callback) {
        if (!stompClient?.connected) return null;
        if (subscriptions[topic]) {
            subscriptions[topic].unsubscribe();
        }
        const sub = stompClient.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch {
                callback(message.body);
            }
        });
        subscriptions[topic] = sub;
        return sub;
    },

    unsubscribe(topic) {
        if (subscriptions[topic]) {
            subscriptions[topic].unsubscribe();
            delete subscriptions[topic];
        }
    },

    isConnected() {
        return stompClient?.connected ?? false;
    },
};

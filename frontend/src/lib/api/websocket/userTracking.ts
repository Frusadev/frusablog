import { SERVER_URL } from "@/lib/config/env";

export interface UserActionConnection {
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

export function createViewConnection(): UserActionConnection {
  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isConnected = false;

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = SERVER_URL.replace('http', 'ws');
      ws = new WebSocket(`${wsUrl}/v1/ua/view`);
      
      ws.onopen = () => {
        isConnected = true;
        console.log('View tracking connected');
      };
      
      ws.onclose = (event) => {
        isConnected = false;
        console.log('View tracking disconnected');
        
        // Don't reconnect if it was a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('View tracking error:', error);
      };
      
      ws.onmessage = () => {
        // Handle heartbeat or other messages from server
        // The server sends bytes(0) as heartbeat
      };
    } catch (error) {
      console.error('Failed to create view WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (ws) {
      ws.close(1000, 'User disconnected');
      ws = null;
    }
    isConnected = false;
  };

  return {
    connect,
    disconnect,
    get isConnected() {
      return isConnected;
    }
  };
}

export function createVisitConnection(): UserActionConnection {
  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isConnected = false;

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = SERVER_URL.replace('http', 'ws');
      ws = new WebSocket(`${wsUrl}/v1/ua/visit`);
      
      ws.onopen = () => {
        isConnected = true;
        console.log('Visit tracking connected');
      };
      
      ws.onclose = (event) => {
        isConnected = false;
        console.log('Visit tracking disconnected');
        
        // Don't reconnect if it was a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Visit tracking error:', error);
      };
      
      ws.onmessage = () => {
        // Handle heartbeat or other messages from server
        // The server sends bytes(0) as heartbeat
      };
    } catch (error) {
      console.error('Failed to create visit WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (ws) {
      ws.close(1000, 'User disconnected');
      ws = null;
    }
    isConnected = false;
  };

  return {
    connect,
    disconnect,
    get isConnected() {
      return isConnected;
    }
  };
}

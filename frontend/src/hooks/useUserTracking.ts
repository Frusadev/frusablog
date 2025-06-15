import { useEffect, useRef } from 'react';
import { 
  createViewConnection, 
  createVisitConnection,
  UserActionConnection 
} from '@/lib/api/websocket/userTracking';

export function useViewTracking() {
  const connectionRef = useRef<UserActionConnection | null>(null);

  useEffect(() => {
    const connection = createViewConnection();
    connectionRef.current = connection;
    connection.connect();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
        connectionRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, []);
}

export function useVisitTracking() {
  const connectionRef = useRef<UserActionConnection | null>(null);

  useEffect(() => {
    const connection = createVisitConnection();
    connectionRef.current = connection;
    connection.connect();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
        connectionRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, []);
}
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export const useRealtime = (eventName, onEvent) => {
  const { socket, isConnected } = useSocket();
  const [lastEvent, setLastEvent] = useState(null);

  const handleEvent = useCallback((data) => {
    setLastEvent(data);
    if (onEvent) {
      onEvent(data);
    }
  }, [onEvent]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on(eventName, handleEvent);

    return () => {
      socket.off(eventName, handleEvent);
    };
  }, [socket, isConnected, eventName, handleEvent]);

  return { lastEvent, isConnected };
};

export default useRealtime;
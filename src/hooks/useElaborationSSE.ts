import { useEffect, useRef, useState, useCallback } from 'react';
import { Elaboration } from '@/types/elaboration';

interface SSEUpdate {
  id: number;
  status: string;
  current: number;
  total: number;
  progress: number;
  errors: Array<{ filename: string; error: string; step?: string }>;
  errorCount: number;
  stage?: string;
  message?: string;
  timestamp: string;
}

interface UseElaborationSSEOptions {
  enabled?: boolean;
  onUpdate?: (data: SSEUpdate) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export function useElaborationSSE(
  elaborationId: number | null,
  options: UseElaborationSSEOptions = {}
) {
  const { enabled = true, onUpdate, onError, onClose } = options;
  const [data, setData] = useState<SSEUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!elaborationId || !enabled) {
      return;
    }

    // Chiudi connessione esistente se presente
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';
    
    // EventSource non supporta header personalizzati, quindi passiamo il token come query parameter
    // Usa la stessa logica di apiClient per recuperare il token
    const getAuthToken = (): string | null => {
      const user = localStorage.getItem('hseb5_current_user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          return parsed.token || null;
        } catch {
          return null;
        }
      }
      return null;
    };
    
    const token = getAuthToken();
    const url = `${apiBaseUrl}/api/v1/elaborations/${elaborationId}/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    try {
      // Nota: withCredentials deve essere false quando Access-Control-Allow-Origin è '*'
      const eventSource = new EventSource(url, {
        withCredentials: false,
      });

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const update: SSEUpdate = JSON.parse(event.data);
          setData(update);
          onUpdate?.(update);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
          onError?.(error as Error);
        }
      };

      eventSource.addEventListener('close', () => {
        setIsConnected(false);
        eventSource.close();
        onClose?.();
      });

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        console.error('EventSource readyState:', eventSource.readyState);
        console.error('EventSource URL:', url);
        
        // Se lo stato è CLOSED (2), la connessione è stata chiusa
        if (eventSource.readyState === EventSource.CLOSED) {
          setIsConnected(false);
          onError?.(new Error('SSE connection closed'));
          eventSource.close();
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          // Se è ancora in connessione, potrebbe essere un problema temporaneo
          console.warn('SSE still connecting, waiting...');
        } else {
          // Altri errori
          setIsConnected(false);
          onError?.(new Error('SSE connection error - readyState: ' + eventSource.readyState));
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error creating EventSource:', error);
      setIsConnected(false);
      onError?.(error as Error);
    }
  }, [elaborationId, enabled, onUpdate, onError, onClose]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && elaborationId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [elaborationId, enabled, connect, disconnect]);

  return {
    data,
    isConnected,
    connect,
    disconnect,
  };
}

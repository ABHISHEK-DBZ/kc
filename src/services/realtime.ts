import { getStoredToken } from './api';

type RealtimeCallback = (data: any) => void;

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<RealtimeCallback>> = new Map();
  private isConnecting: boolean = false;

  connect() {
    const token = getStoredToken();
    if (!token) return;

    if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const url = `/api/realtime?token=${encodeURIComponent(token)}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[Realtime] SSE Connection established.');
        this.isConnecting = false;
      };

      this.eventSource.onerror = (err) => {
        console.warn('[Realtime] SSE Connection error. Reconnecting in 5s...', err);
        this.isConnecting = false;
        this.eventSource?.close();
        this.eventSource = null;
        setTimeout(() => this.connect(), 5000);
      };

      // Register listener dispatcher for known backend events
      const eventTypes = [
        'connected',
        'AGENT_STARTED',
        'AGENT_COMPLETED',
        'TASK_CREATED',
        'TASK_APPROVED',
        'TASK_REJECTED',
        'PURCHASE_ORDER_CREATED',
        'PURCHASE_ORDER_APPROVED',
        'PURCHASE_ORDER_REJECTED',
        'SHOP_CREATED',
        'SHOP_HEALTH_UPDATED',
        'COMMUNITY_POST_CREATED',
        'COMMUNITY_POST_CLASSIFIED',
        'COMMUNITY_REPLY_CREATED',
        'NOTIFICATION_CREATED',
        'ANOMALY_DETECTED',
        'CASH_VARIANCE_FLAGGED'
      ];

      eventTypes.forEach(evt => {
        this.eventSource?.addEventListener(evt, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            this.dispatch(evt, data);
            this.dispatch('*', { event: evt, data });
          } catch (err) {
            console.error(`[Realtime] Failed to parse event '${evt}':`, err);
          }
        });
      });
    } catch (err) {
      console.error('[Realtime] Failed to initialize SSE client:', err);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('[Realtime] SSE Disconnected.');
    }
    this.isConnecting = false;
  }

  subscribe(eventType: string, callback: RealtimeCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Auto-connect if not connected
    if (!this.eventSource) {
      this.connect();
    }

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private dispatch(eventType: string, data: any) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[Realtime] Callback execution failed for ${eventType}:`, err);
        }
      });
    }
  }
}

export const realtimeClient = new RealtimeClient();

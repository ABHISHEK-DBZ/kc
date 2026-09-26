import { Response } from 'express';
import { AuthenticatedUser, resolveUserScope } from '../middleware/auth.js';

interface ClientConnection {
  id: string;
  user: AuthenticatedUser;
  res: Response;
  allowedShopIds: string[] | null;
  isGlobal: boolean;
}

class RealtimeHub {
  private clients: Map<string, ClientConnection> = new Map();

  addClient(clientId: string, user: AuthenticatedUser, res: Response) {
    const scope = resolveUserScope(user);
    this.clients.set(clientId, {
      id: clientId,
      user,
      res,
      allowedShopIds: scope.allowedShopIds,
      isGlobal: scope.isGlobal
    });

    console.log(`[RealtimeHub] Client connected: ${user.email} (${user.role}). Total active: ${this.clients.size}`);

    // Send initial connected handshake
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', role: user.role, timestamp: new Date().toISOString() })}\n\n`);
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
    console.log(`[RealtimeHub] Client disconnected. Total active: ${this.clients.size}`);
  }

  // Publish event with territorial/shop boundary enforcement
  broadcast(eventType: string, payload: any, scopeShopId?: string) {
    const dataStr = JSON.stringify({
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      shop_id: scopeShopId || null
    });

    const message = `event: ${eventType}\ndata: ${dataStr}\n\n`;

    this.clients.forEach((client) => {
      // Role scope check
      if (scopeShopId && !client.isGlobal) {
        if (!client.allowedShopIds || !client.allowedShopIds.includes(scopeShopId)) {
          // Skip client because event is outside their authorized store/region
          return;
        }
      }

      try {
        client.res.write(message);
      } catch (err) {
        console.error(`[RealtimeHub] Error sending to ${client.user.email}:`, err);
        this.removeClient(client.id);
      }
    });
  }

  // Ping heartbeats to prevent connection timeout
  startHeartbeat() {
    setInterval(() => {
      this.clients.forEach((client) => {
        try {
          client.res.write(': heartbeat\n\n');
        } catch {
          this.removeClient(client.id);
        }
      });
    }, 25000);
  }
}

export const realtimeHub = new RealtimeHub();
realtimeHub.startHeartbeat();

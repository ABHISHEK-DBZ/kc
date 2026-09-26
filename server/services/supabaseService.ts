import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { db } from '../db/database.js';

dotenv.config();

class SupabaseService {
  private client: SupabaseClient | null = null;
  private url: string | null = null;
  private key: string | null = null;

  constructor() {
    this.initClient();
  }

  public initClient(): boolean {
    dotenv.config();
    this.url = process.env.SUPABASE_URL?.trim() || null;
    this.key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_KEY?.trim() || null;

    if (this.url && this.key && this.url.startsWith('http')) {
      try {
        this.client = createClient(this.url, this.key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        console.log(`[Supabase] Client initialized successfully for: ${this.url}`);
        return true;
      } catch (err: any) {
        console.error('[Supabase] Initialization error:', err.message);
        this.client = null;
        return false;
      }
    } else {
      this.client = null;
      return false;
    }
  }

  public isConfigured(): boolean {
    if (!this.client) {
      this.initClient();
    }
    return Boolean(this.client && this.url && this.key);
  }

  public getStatus() {
    if (!this.client) {
      this.initClient();
    }
    return {
      configured: this.isConfigured(),
      hasKey: Boolean(this.key),
      keyPrefix: this.key ? this.key.substring(0, 10) + '...' : null,
      url: this.url || null,
      urlConfigured: Boolean(this.url && this.url.startsWith('http')),
      timestamp: new Date().toISOString()
    };
  }

  public getClient(): SupabaseClient | null {
    if (!this.client && this.url && this.key) {
      this.initClient();
    }
    return this.client;
  }

  /**
   * Tests live connection against the Supabase instance
   */
  public async testConnection(): Promise<{ connected: boolean; message: string; details?: any }> {
    if (!this.isConfigured()) {
      if (!this.url || !this.url.startsWith('http')) {
        return {
          connected: false,
          message: 'Supabase URL is missing or invalid. Please configure SUPABASE_URL in .env (e.g. https://xyzcompany.supabase.co)'
        };
      }
      return {
        connected: false,
        message: 'Supabase API key is missing. Please configure SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY in .env'
      };
    }

    try {
      // Query a standard system or health endpoint via client
      const { data, error } = await this.client!.from('shops').select('count', { count: 'exact', head: true });
      if (error) {
        // Table might not exist yet if migrations haven't run, check if auth or schema responded
        return {
          connected: true,
          message: `Connected to Supabase endpoint (${this.url}), but query returned: ${error.message}. Database schema migration may be pending.`,
          details: error
        };
      }

      return {
        connected: true,
        message: `Successfully connected to Supabase (${this.url})`,
        details: { shopCount: data }
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `Failed to connect to Supabase: ${err.message}`,
        details: err
      };
    }
  }

  /**
   * Syncs core records from local SQLite to Supabase
   */
  public async syncToSupabase(): Promise<{ success: boolean; synced: Record<string, number>; errors: string[] }> {
    const results = {
      success: false,
      synced: {
        shops: 0,
        inventory_items: 0,
        purchase_orders: 0,
        inventory_recommendations: 0,
        community_posts: 0
      },
      errors: [] as string[]
    };

    if (!this.isConfigured()) {
      results.errors.push('Supabase is not fully configured (missing SUPABASE_URL or valid key)');
      return results;
    }

    const client = this.client!;

    try {
      // 1. Sync Shops
      try {
        const shops = db.prepare('SELECT * FROM shops').all();
        if (shops.length > 0) {
          const { error } = await client.from('shops').upsert(shops, { onConflict: 'id' });
          if (error) results.errors.push(`Shops sync: ${error.message}`);
          else results.synced.shops = shops.length;
        }
      } catch (err: any) {
        results.errors.push(`Shops read: ${err.message}`);
      }

      // 2. Sync Inventory Items
      try {
        const items = db.prepare('SELECT * FROM inventory_items').all();
        if (items.length > 0) {
          const { error } = await client.from('inventory_items').upsert(items, { onConflict: 'id' });
          if (error) results.errors.push(`Inventory sync: ${error.message}`);
          else results.synced.inventory_items = items.length;
        }
      } catch (err: any) {
        results.errors.push(`Inventory read: ${err.message}`);
      }

      // 3. Sync Recommendations
      try {
        const recs = db.prepare('SELECT * FROM inventory_recommendations').all();
        if (recs.length > 0) {
          const { error } = await client.from('inventory_recommendations').upsert(recs, { onConflict: 'id' });
          if (error) results.errors.push(`Recommendations sync: ${error.message}`);
          else results.synced.inventory_recommendations = recs.length;
        }
      } catch (err: any) {
        results.errors.push(`Recommendations read: ${err.message}`);
      }

      // 4. Sync Purchase Orders
      try {
        const pos = db.prepare('SELECT * FROM purchase_orders').all();
        if (pos.length > 0) {
          const { error } = await client.from('purchase_orders').upsert(pos, { onConflict: 'id' });
          if (error) results.errors.push(`Purchase orders sync: ${error.message}`);
          else results.synced.purchase_orders = pos.length;
        }
      } catch (err: any) {
        results.errors.push(`Purchase orders read: ${err.message}`);
      }

      // 5. Sync Community Posts
      try {
        const posts = db.prepare('SELECT * FROM community_posts').all();
        if (posts.length > 0) {
          const { error } = await client.from('community_posts').upsert(posts, { onConflict: 'id' });
          if (error) results.errors.push(`Community posts sync: ${error.message}`);
          else results.synced.community_posts = posts.length;
        }
      } catch (err: any) {
        results.errors.push(`Community posts read: ${err.message}`);
      }

      results.success = results.errors.length === 0;
      return results;
    } catch (err: any) {
      results.errors.push(`Fatal sync exception: ${err.message}`);
      return results;
    }
  }
}

export const supabaseService = new SupabaseService();

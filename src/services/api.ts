export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'HQ_OWNER' | 'HQ_IT' | 'AREA_MANAGER' | 'FRANCHISE_OWNER' | 'STORE_MANAGER';
  region_id?: string | null;
  franchise_id?: string | null;
  shop_id?: string | null;
  phone?: string | null;
  avatar_initials?: string;
}

const TOKEN_KEY = 'khatacopilot_auth_token';
const USER_KEY = 'khatacopilot_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (res.status === 401) {
    clearStoredAuth();
    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser; scope: any }> {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredAuth(data.token, data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout notification error:', e);
    } finally {
      clearStoredAuth();
    }
  },

  async getMe(): Promise<{ user: AuthUser; scope: any }> {
    return request('/api/auth/me');
  },

  // Shops
  async getShops(): Promise<any[]> {
    return request('/api/shops');
  },

  async getShop(id: string): Promise<any> {
    return request(`/api/shops/${id}`);
  },

  async createShop(shopData: any): Promise<any> {
    return request('/api/shops', {
      method: 'POST',
      body: JSON.stringify(shopData)
    });
  },

  async getShopSales(id: string): Promise<any[]> {
    return request(`/api/shops/${id}/sales`);
  },

  async getShopInventory(id: string): Promise<any[]> {
    return request(`/api/shops/${id}/inventory`);
  },

  async getShopUdhaar(id: string): Promise<any[]> {
    return request(`/api/shops/${id}/udhaar`);
  },

  // Operational Data (Scoped by authenticated user role)
  async getCustomers(): Promise<any[]> {
    return request('/api/customers');
  },

  async getSales(): Promise<any[]> {
    return request('/api/sales');
  },

  async getInventory(): Promise<any[]> {
    return request('/api/inventory');
  },

  async getUdhaar(): Promise<any[]> {
    return request('/api/udhaar');
  },

  async getStaffActivities(): Promise<any[]> {
    return request('/api/staff-activities');
  },

  // Analytics
  async getOverviewAnalytics(): Promise<any> {
    return request('/api/analytics/overview');
  },

  async getSalesHistory(): Promise<any[]> {
    return request('/api/analytics/sales-history');
  },

  // AI Agents
  async getAgents(): Promise<any[]> {
    return request('/api/agents');
  },

  async runAgent(agentId: string): Promise<any> {
    return request(`/api/agents/${agentId}/run`, {
      method: 'POST'
    });
  },

  async getAgentRuns(agentId: string): Promise<any[]> {
    return request(`/api/agents/${agentId}/runs`);
  },

  async getAgentFindings(agentId: string): Promise<any[]> {
    return request(`/api/agents/${agentId}/findings`);
  },

  async getAgentTasks(agentId: string): Promise<any[]> {
    return request(`/api/agents/${agentId}/tasks`);
  },

  async approveTask(taskId: string): Promise<any> {
    return request(`/api/agents/tasks/${taskId}/approve`, {
      method: 'POST'
    });
  },

  async rejectTask(taskId: string, reason?: string): Promise<any> {
    return request(`/api/agents/tasks/${taskId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Purchase Orders
  async getPurchaseOrders(): Promise<any[]> {
    return request('/api/purchase-orders');
  },

  async approvePO(poId: string): Promise<any> {
    return request(`/api/purchase-orders/${poId}/approve`, {
      method: 'POST'
    });
  },

  async rejectPO(poId: string, reason?: string): Promise<any> {
    return request(`/api/purchase-orders/${poId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Community & IT Support
  async getCommunityPosts(): Promise<any[]> {
    return request('/api/community/posts');
  },

  async createCommunityPost(postData: any): Promise<any> {
    return request('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },

  async getPostReplies(postId: string): Promise<any[]> {
    return request(`/api/community/posts/${postId}/replies`);
  },

  async createReply(postId: string, content: string, is_solution?: boolean): Promise<any> {
    return request(`/api/community/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content, is_solution })
    });
  },

  async getKnownIssues(): Promise<any[]> {
    return request('/api/community/known-issues');
  },

  // Reports
  async getGSTDraft(): Promise<any> {
    return request('/api/reports/gst-draft');
  },

  exportReportUrl(type: string): string {
    const token = getStoredToken();
    return `/api/reports/export?type=${type}&token=${token || ''}`;
  },

  // Audit Logs
  async getAuditLogs(): Promise<any[]> {
    return request('/api/audit-logs');
  },

  // Search
  async search(q: string): Promise<any> {
    return request(`/api/search?q=${encodeURIComponent(q)}`);
  }
};

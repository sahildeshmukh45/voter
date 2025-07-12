// API Configuration and Service Layer for Spring Boot Backend Integration

const API_BASE_URL = 'http://localhost:8080/api';

// API Response wrapper type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// Auth token management
class TokenManager {
  private static readonly TOKEN_KEY = 'voter_admin_token';
  private static readonly USER_KEY = 'voter_admin_user';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

// HTTP Client with automatic token handling
class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = TokenManager.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      console.log('ApiClient: Making request to', `${API_BASE_URL}${endpoint}`, 'with config:', config);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      console.log('ApiClient: Response status:', response.status, response.statusText);

      if (response.status === 401) {
        // Only logout on auth-related endpoints, not on data endpoints
        if (endpoint.includes('/auth/') || endpoint === '/auth/me') {
          TokenManager.removeToken();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        } else {
          // For other endpoints, just throw error without logging out
          console.warn('ApiClient: 401 error on non-auth endpoint:', endpoint);
          throw new Error('Access denied - insufficient permissions');
        }
      }

      if (response.status === 403) {
        throw new Error('Access forbidden - you do not have permission to perform this action');
      }

      if (response.status === 404) {
        throw new Error('Resource not found');
      }

      if (response.status === 500) {
        throw new Error('Server error - please try again later');
      }

      if (response.status >= 400) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('ApiClient: Response data:', data);

      return data;
    } catch (error) {
      console.error('ApiClient: Request failed:', error);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  static async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const token = TokenManager.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (response.status === 401) {
      // Only logout on auth-related endpoints, not on data endpoints
      if (endpoint.includes('/auth/')) {
        TokenManager.removeToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      } else {
        // For other endpoints, just throw error without logging out
        console.warn('ApiClient: 401 error on file upload endpoint:', endpoint);
        throw new Error('Access denied - insufficient permissions');
      }
    }

    if (response.status === 403) {
      throw new Error('Access forbidden - you do not have permission to upload files');
    }

    if (response.status === 413) {
      throw new Error('File too large - please choose a smaller file');
    }

    if (response.status === 415) {
      throw new Error('Unsupported file type - please upload a valid CSV, Excel, or PDF file');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'File upload failed');
    }

    return data;
  }
}

// Authentication API
export const authApi = {
  login: async (username: string, password: string) => {
    console.log('API: Sending login request for mobile:', username); // username field contains mobile number
    const response = await ApiClient.post<{token: string, username: string, role: string, userType: string}>('/auth/login', {
      username, // Backend expects 'username' field but it contains mobile number
      password
    });

    console.log('API: Login response received:', response);

    if (response.success) {
      console.log('API: Login successful, setting token and user');
      TokenManager.setToken(response.data.token);
      TokenManager.setUser(response.data);
    } else {
      console.log('API: Login failed');
    }

    return response;
  },

  logout: async () => {
    try {
      await ApiClient.post('/auth/logout');
    } finally {
      TokenManager.removeToken();
    }
  },

  getCurrentUser: () => {
    return ApiClient.get<any>('/auth/me');
  },

  changePassword: (oldPassword: string, newPassword: string) => {
    return ApiClient.post('/auth/change-password', {
      oldPassword,
      newPassword
    });
  }
};

// Users API
export const usersApi = {
  getAll: (page = 0, size = 10) => {
    return ApiClient.get<any>(`/users?page=${page}&size=${size}`);
  },

  getById: (id: number) => {
    return ApiClient.get<any>(`/users/${id}`);
  },

  search: (lastName: string) => {
    return ApiClient.get<any>(`/users/search?lastName=${lastName}`);
  },

  advancedSearch: (filters: {
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: string;
    vidhansabhaNo?: string;
    vibhaghKramank?: string;
    paid?: boolean;
    page?: number;
    size?: number;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    return ApiClient.get<any>(`/users/search/advanced?${params.toString()}`);
  },

  create: (user: any) => {
    return ApiClient.post<any>('/users', user);
  },

  update: (id: number, user: any) => {
    return ApiClient.put<any>(`/users/${id}`, user);
  },

  delete: (id: number) => {
    return ApiClient.delete<any>(`/users/${id}`);
  },

  markAsPaid: (id: number, amount: number) => {
    return ApiClient.post<any>(`/users/${id}/mark-paid`, { amount });
  },

  getByStatus: (paid: boolean) => {
    return ApiClient.get<any>(`/users/by-status?paid=${paid}`);
  },

  getStatistics: () => {
    return ApiClient.get<any>('/users/statistics');
  }
};

// Agents API
export const agentsApi = {
  getAll: () => {
    return ApiClient.get<any>('/admins/agents');
  },

  getById: (id: string) => {
    return ApiClient.get<any>(`/admins/agents/${id}`);
  },

  create: (agent: any) => {
    return ApiClient.post<any>('/admins/agents', agent);
  },

  update: (id: string, agent: any) => {
    return ApiClient.put<any>(`/admins/agents/${id}`, agent);
  },

  delete: (id: string) => {
    return ApiClient.delete<any>(`/admins/agents/${id}`);
  },

  block: (id: string) => {
    return ApiClient.post<any>(`/admins/agents/${id}/block`);
  },

  unblock: (id: string) => {
    return ApiClient.post<any>(`/admins/agents/${id}/unblock`);
  },

  getStatistics: () => {
    return ApiClient.get<any>('/agent/statistics');
  }
};

// Administrators API (Master only)
export const adminsApi = {
  getAll: () => {
    return ApiClient.get<any>('/admins');
  },

  getById: (id: string) => {
    return ApiClient.get<any>(`/admins/${id}`);
  },

  create: (admin: any) => {
    return ApiClient.post<any>('/admins', admin);
  },

  update: (id: string, admin: any) => {
    return ApiClient.put<any>(`/admins/${id}`, admin);
  },

  delete: (id: string) => {
    return ApiClient.delete<any>(`/admins/${id}`);
  },

  block: (id: string) => {
    return ApiClient.post<any>(`/admins/${id}/block`);
  },

  unblock: (id: string) => {
    return ApiClient.post<any>(`/admins/${id}/unblock`);
  }
};

// Location Tracking API
export const locationApi = {
  getAllAgents: () => {
    return ApiClient.get<any>('/location/agents');
  },

  getActiveAgents: () => {
    return ApiClient.get<any>('/location/agents/active');
  },

  getAgentLocation: (id: string) => {
    return ApiClient.get<any>(`/location/agents/${id}`);
  },

  getLocationHistory: (id: string) => {
    return ApiClient.get<any>(`/location/agents/${id}/history`);
  },

  getAllLocationHistory: () => {
    return ApiClient.get<any>('/location/history');
  },

  getOnlineCount: () => {
    return ApiClient.get<any>('/location/agents/online/count');
  },

  isAgentOnline: (id: string) => {
    return ApiClient.get<any>(`/location/agents/${id}/online`);
  }
};

// Transactions API
export const transactionsApi = {
  getAll: (page = 0, size = 10) => {
    return ApiClient.get<any>(`/transactions?page=${page}&size=${size}`);
  },

  getById: (id: string) => {
    return ApiClient.get<any>(`/transactions/${id}`);
  },

  getByAgent: (agentId: string) => {
    return ApiClient.get<any>(`/transactions/agent/${agentId}`);
  },

  getByUser: (userId: number) => {
    return ApiClient.get<any>(`/transactions/user/${userId}`);
  },

  getTodaysTransactions: () => {
    return ApiClient.get<any>('/transactions/today');
  },

  getStatistics: () => {
    return ApiClient.get<any>('/transactions/statistics');
  },

  getByDateRange: (startDate: string, endDate: string) => {
    return ApiClient.get<any>(`/transactions/date-range?startDate=${startDate}&endDate=${endDate}`);
  },

  getMonthlyStats: () => {
    return ApiClient.get<any>('/transactions/monthly-stats');
  }
};

// File Upload API
export const filesApi = {
  uploadUsers: (file: File) => {
    return ApiClient.uploadFile<any>('/files/upload/users', file);
  },

  exportUsers: async (format = 'xlsx', paid?: boolean) => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (paid !== undefined) {
      params.append('paid', paid.toString());
    }

    const response = await fetch(`${API_BASE_URL}/files/export/users?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TokenManager.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export users');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  exportTransactions: async (format = 'xlsx', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/files/export/transactions?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TokenManager.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_export.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  exportAgents: async (format = 'xlsx', status?: string) => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/files/export/agents?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TokenManager.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export agents');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agents_export.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getUploadHistory: () => {
    return ApiClient.get<any>('/files/upload/history');
  },

  validateFile: (file: File) => {
    return ApiClient.uploadFile<any>('/files/validate', file);
  }
};

// WebSocket for real-time location tracking
export class LocationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect(onLocationUpdate: (data: any) => void, onAgentOnline: (data: any) => void, onAgentOffline: (data: any) => void) {
    const token = TokenManager.getToken();
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    const wsUrl = `ws://localhost:8080/api/ws?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected for location tracking');
      this.reconnectAttempts = 0;
      
      // Subscribe to location updates
      this.send('/app/location/get-all-active', {});
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.destination) {
        case '/topic/agent-locations':
          onLocationUpdate(message.body);
          break;
        case '/topic/agent-online':
          onAgentOnline(message.body);
          break;
        case '/topic/agent-offline':
          onAgentOffline(message.body);
          break;
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(onLocationUpdate, onAgentOnline, onAgentOffline);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(onLocationUpdate: (data: any) => void, onAgentOnline: (data: any) => void, onAgentOffline: (data: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(onLocationUpdate, onAgentOnline, onAgentOffline);
      }, this.reconnectInterval);
    }
  }

  private send(destination: string, body: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        destination,
        body
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Vidhansabha API
export const vidhansabhaApi = {
  getAll: () => {
    return ApiClient.get<any>('/vidhansabha');
  },

  getByNumber: (vidhansabhaNo: number) => {
    return ApiClient.get<any>(`/vidhansabha/${vidhansabhaNo}`);
  },

  search: (term: string) => {
    return ApiClient.get<any>(`/vidhansabha/search?term=${encodeURIComponent(term)}`);
  },

  getByDistrict: (districtName: string) => {
    return ApiClient.get<any>(`/vidhansabha/district/${encodeURIComponent(districtName)}`);
  },

  getAllDistricts: () => {
    return ApiClient.get<any>('/vidhansabha/districts');
  },

  getByCategory: (category: string) => {
    return ApiClient.get<any>(`/vidhansabha/category/${category}`);
  },

  initializeData: () => {
    return ApiClient.post<any>('/vidhansabha/initialize', {});
  }
};

// Health Check API
export const healthApi = {
  check: () => {
    return ApiClient.get<any>('/health');
  }
};

// Export token manager for use in components
export { TokenManager };

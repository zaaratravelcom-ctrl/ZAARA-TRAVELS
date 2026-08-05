/**
 * Zaara Travels - Admin Authentication & Operations Service
 * Handles JWT storage, Bearer Headers, Auth API calls, and Admin Data API calls
 */

const TOKEN_KEY = 'zaara_admin_jwt_token';
const ADMIN_USER_KEY = 'zaara_admin_user_data';

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'Admin' | 'Staff';
}

export const getStoredAdminToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const getStoredAdminUser = (): AdminUser | null => {
  try {
    const data = localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const storeAdminSession = (token: string, admin: AdminUser, remember: boolean = true) => {
  try {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
  } catch (e) {
    console.error('Failed to store session:', e);
  }
};

export const clearAdminSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
};

// Helper for authenticated API requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok && response.status === 401) {
    clearAdminSession();
    window.dispatchEvent(new Event('zaara_admin_logout'));
  }

  return { ok: response.ok, status: response.status, data };
};

// Admin Authentication API Calls
export const loginAdminApi = async (username: string, password: string, remember: boolean = true) => {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (res.ok && data.success && data.token) {
    storeAdminSession(data.token, data.admin, remember);
  }
  return { ok: res.ok, data };
};

export const verifyAdminSessionApi = async () => {
  return await fetchWithAuth('/api/admin/auth/me');
};

export const changeAdminPasswordApi = async (currentPassword: string, newPassword: string) => {
  return await fetchWithAuth('/api/admin/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const requestForgotPasswordApi = async (email: string) => {
  const res = await fetch('/api/admin/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await res.json();
};

export const resetPasswordWithTokenApi = async (token: string, newPassword: string) => {
  const res = await fetch('/api/admin/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  return await res.json();
};

// Admin Data API Calls
export const fetchDashboardStatsApi = async () => {
  return await fetchWithAuth('/api/admin/dashboard/stats');
};

export const fetchBookingsApi = async () => {
  return await fetchWithAuth('/api/admin/bookings');
};

export const updateBookingStatusApi = async (bookingId: string, paymentStatus: string, bookingStatus?: string) => {
  return await fetchWithAuth(`/api/admin/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ paymentStatus, bookingStatus }),
  });
};

export const deleteBookingApi = async (bookingId: string) => {
  return await fetchWithAuth(`/api/admin/bookings/${bookingId}`, {
    method: 'DELETE',
  });
};

export const fetchCabBookingsApi = async () => {
  return await fetchWithAuth('/api/admin/cab-bookings');
};

export const fetchCustomersApi = async () => {
  return await fetchWithAuth('/api/admin/customers');
};

export const fetchPaymentLogsApi = async () => {
  return await fetchWithAuth('/api/admin/payments');
};

export const fetchAuditLogsApi = async () => {
  return await fetchWithAuth('/api/admin/logs');
};

export const fetchWebsiteSettingsApi = async () => {
  return await fetchWithAuth('/api/admin/settings');
};

export const saveWebsiteSettingsApi = async (settings: any) => {
  return await fetchWithAuth('/api/admin/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
};

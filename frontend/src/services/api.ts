import axios from 'axios';
import {
  User,
  UserStats,
  ParkingLocation,
  ParkingSlot,
  Booking,
  BillingCalculation,
  AdminDashboardStats,
  RevenueReportData,
  AdminUserListItem,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// AUTH API
export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/login', credentials);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ success: boolean; user: User; stats: UserStats }>('/auth/me');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put<{ success: boolean; message: string; user: User }>('/auth/profile', data);
    return res.data;
  },
};

// LOCATIONS API
export const locationsApi = {
  getAll: async (includeInactive = false) => {
    const res = await api.get<{ success: boolean; locations: ParkingLocation[] }>('/locations', {
      params: { includeInactive },
    });
    return res.data.locations;
  },
  getById: async (id: number) => {
    const res = await api.get<{ success: boolean; location: ParkingLocation }>(`/locations/${id}`);
    return res.data.location;
  },
  create: async (data: any) => {
    const res = await api.post<{ success: boolean; location: ParkingLocation }>('/locations', data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await api.put<{ success: boolean; location: ParkingLocation }>(`/locations/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/locations/${id}`);
    return res.data;
  },
};

// SLOTS API
export const slotsApi = {
  getByLocation: async (locationId: number, startTime?: string, endTime?: string) => {
    const res = await api.get<{ success: boolean; slots: ParkingSlot[] }>(`/locations/${locationId}/slots`, {
      params: { startTime, endTime },
    });
    return res.data.slots;
  },
  create: async (locationId: number, data: any) => {
    const res = await api.post<{ success: boolean; slot: ParkingSlot }>(`/locations/${locationId}/slots`, data);
    return res.data;
  },
  update: async (slotId: number, data: any) => {
    const res = await api.put<{ success: boolean; slot: ParkingSlot }>(`/slots/${slotId}`, data);
    return res.data;
  },
  delete: async (slotId: number) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/slots/${slotId}`);
    return res.data;
  },
};

// BOOKINGS API
export const bookingsApi = {
  calculatePreview: async (data: { locationId: number; startTime: string; endTime: string }) => {
    const res = await api.post<{ success: boolean; calculation: BillingCalculation }>('/bookings/calculate', data);
    return res.data.calculation;
  },
  create: async (data: {
    slotId: number;
    startTime: string;
    endTime: string;
    vehicleNumber: string;
    paymentMethod?: string;
  }) => {
    const res = await api.post<{ success: boolean; message: string; booking: Booking }>('/bookings', data);
    return res.data;
  },
  getAll: async (params?: { filter?: string; locationId?: number; date?: string; search?: string }) => {
    const res = await api.get<{ success: boolean; bookings: Booking[] }>('/bookings', { params });
    return res.data.bookings;
  },
  getById: async (id: number) => {
    const res = await api.get<{ success: boolean; booking: Booking }>(`/bookings/${id}`);
    return res.data.booking;
  },
  cancel: async (id: number) => {
    const res = await api.put<{ success: boolean; message: string; booking: Booking }>(`/bookings/${id}/cancel`);
    return res.data;
  },
};

// ADMIN API
export const adminApi = {
  getStats: async () => {
    const res = await api.get<{ success: boolean; stats: AdminDashboardStats }>('/admin/dashboard');
    return res.data.stats;
  },
  getRevenue: async () => {
    const res = await api.get<{ success: boolean } & RevenueReportData>('/admin/revenue');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get<{ success: boolean; users: AdminUserListItem[] }>('/admin/users');
    return res.data.users;
  },
  deleteUser: async (userId: number) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/admin/users/${userId}`);
    return res.data;
  },
};

export default api;

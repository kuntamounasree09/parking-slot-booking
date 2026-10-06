export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface UserStats {
  totalBookings: number;
  activeBookings: number;
  upcomingBookings: number;
  totalSpent: number;
}

export interface ParkingLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  opening_time: string;
  closing_time: string;
  hourly_rate: number;
  image_url?: string;
  is_active: boolean;
  total_slots?: number;
  available_slots_now?: number;
}

export type SlotStatus = 'AVAILABLE' | 'MAINTENANCE';
export type SlotDynamicStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';

export interface ParkingSlot {
  id: number;
  location_id: number;
  slot_number: string;
  floor: string;
  vehicle_type: 'CAR' | 'BIKE' | 'EV';
  status: SlotStatus;
  current_status?: SlotDynamicStatus;
  conflicting_booking_code?: string;
  booked_start?: string;
  booked_end?: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED';

export interface Booking {
  id: number;
  booking_code: string;
  user_id: number;
  slot_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  hourly_rate: number;
  total_amount: number;
  vehicle_number: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  slot_number?: string;
  floor?: string;
  location_id?: number;
  location_name?: string;
  location_address?: string;
  location_city?: string;
}

export interface BillingCalculation {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  durationHours: number;
  hourlyRate: number;
  totalAmount: number;
  formula: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalLocations: number;
  totalSlots: number;
  todayBookings: number;
  activeBookings: number;
  totalRevenue: number;
  slotUtilization: number;
}

export interface RevenueReportData {
  dailyTrends: {
    label: string;
    date: string;
    revenue: number;
    bookings: number;
  }[];
  revenueByLocation: {
    id: number;
    name: string;
    totalBookings: number;
    revenue: number;
  }[];
  statusDistribution: {
    name: string;
    value: number;
  }[];
  slotStatus: {
    available: number;
    booked: number;
    maintenance: number;
  };
}

export interface AdminUserListItem extends User {
  booking_count: number;
  total_spent: number;
}

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password_hash?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ParkingLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  opening_time: string; // e.g. "06:00:00"
  closing_time: string; // e.g. "23:00:00"
  hourly_rate: number;
  image_url?: string;
  is_active: boolean;
  total_slots?: number;
  available_slots?: number;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
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
  updated_at: string;

  // Joined fields
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  slot_number?: string;
  floor?: string;
  location_id?: number;
  location_name?: string;
  location_address?: string;
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

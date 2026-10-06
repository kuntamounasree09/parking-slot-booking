-- ========================================================
-- Parking Slot Booking with Time-Based Billing Database Schema
-- Database: PostgreSQL
-- ========================================================

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS parking_slots CASCADE;
DROP TABLE IF EXISTS parking_locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PARKING LOCATIONS TABLE
CREATE TABLE parking_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Metro City',
    opening_time TIME NOT NULL DEFAULT '06:00:00',
    closing_time TIME NOT NULL DEFAULT '23:00:00',
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 40.00,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PARKING SLOTS TABLE
CREATE TABLE parking_slots (
    id SERIAL PRIMARY KEY,
    location_id INT NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
    slot_number VARCHAR(20) NOT NULL,
    floor VARCHAR(50) NOT NULL DEFAULT 'Ground Floor',
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'CAR' CHECK (vehicle_type IN ('CAR', 'BIKE', 'EV')),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'MAINTENANCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, slot_number)
);

-- 4. BOOKINGS TABLE
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id INT NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING', 'REFUNDED')),
    payment_method VARCHAR(50) DEFAULT 'Online UPI / Card',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PERFORMANCE AND CONFLICT DETECTION INDEXES
CREATE INDEX idx_bookings_slot_time ON bookings (slot_id, start_time, end_time);
CREATE INDEX idx_bookings_user_id ON bookings (user_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_parking_slots_location ON parking_slots (location_id);
CREATE INDEX idx_parking_slots_status ON parking_slots (status);

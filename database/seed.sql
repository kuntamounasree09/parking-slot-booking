-- ========================================================
-- Parking Slot Booking Database Seed Data (PostgreSQL)
-- ========================================================

-- Passwords pre-hashed with bcrypt (cost factor 10):
-- Admin@123 -> $2a$10$wO4qQ3L6Yw1P1gMvN9iNseZzL9dQgG8qK8f.QhYwE/4B9K8L6h7mO
-- User@123  -> $2a$10$sX8U1m6Q3b7e7V9sL7q5OeFzY4iJ3k2p1u0m9n8b7v6c5x4z3a2b1

-- 1. USERS
INSERT INTO users (name, email, phone, password_hash, role)
VALUES 
  ('System Administrator', 'admin@parking.com', '+91 9876543210', '$2a$10$tZg/M5q7X0bK5iXy3eC7oOfZ7kQvP5xU9zN0wY6vR4mK8tJ1oP2qG', 'ADMIN'),
  ('Rahul Sharma', 'user@parking.com', '+91 9123456780', '$2a$10$tZg/M5q7X0bK5iXy3eC7oOfZ7kQvP5xU9zN0wY6vR4mK8tJ1oP2qG', 'USER'),
  ('Sarah Jenkins', 'sarah@parking.com', '+91 9822334455', '$2a$10$tZg/M5q7X0bK5iXy3eC7oOfZ7kQvP5xU9zN0wY6vR4mK8tJ1oP2qG', 'USER')
ON CONFLICT (email) DO NOTHING;

-- 2. PARKING LOCATIONS
INSERT INTO parking_locations (id, name, address, city, opening_time, closing_time, hourly_rate, is_active)
VALUES 
  (1, 'Downtown Central Plaza', '100 Main Street, Commercial Hub', 'Bengaluru', '06:00:00', '23:00:00', 50.00, true),
  (2, 'Tech City Silicon Gateway', 'Tower 4, Electronic City Expressway', 'Bengaluru', '07:00:00', '22:00:00', 40.00, true),
  (3, 'Grand City Mall Hub', 'MG Road, Metro Gate 2', 'Bengaluru', '08:00:00', '23:30:00', 60.00, true),
  (4, 'Airport Express Terminal', 'Terminal 2 Approach, Airport Road', 'Bengaluru', '05:00:00', '23:59:00', 70.00, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('parking_locations_id_seq', (SELECT MAX(id) FROM parking_locations));

-- 3. PARKING SLOTS
INSERT INTO parking_slots (location_id, slot_number, floor, vehicle_type, status)
VALUES
  -- Downtown (1)
  (1, 'A01', 'Level 1 (Ground)', 'CAR', 'AVAILABLE'),
  (1, 'A02', 'Level 1 (Ground)', 'CAR', 'AVAILABLE'),
  (1, 'A03', 'Level 1 (Ground)', 'CAR', 'AVAILABLE'),
  (1, 'A04', 'Level 1 (Ground)', 'CAR', 'AVAILABLE'),
  (1, 'A05', 'Level 1 (Ground)', 'CAR', 'AVAILABLE'),
  (1, 'A06', 'Level 1 (Ground)', 'CAR', 'AVAILABLE'),
  (1, 'B01', 'Level 2 (Basement)', 'CAR', 'AVAILABLE'),
  (1, 'B02', 'Level 2 (Basement)', 'CAR', 'AVAILABLE'),
  (1, 'B03', 'Level 2 (Basement)', 'CAR', 'AVAILABLE'),
  (1, 'B04', 'Level 2 (Basement)', 'CAR', 'AVAILABLE'),
  (1, 'EV01', 'Level 1 (Ground)', 'EV', 'AVAILABLE'),
  (1, 'B05', 'Level 2 (Basement)', 'CAR', 'MAINTENANCE'),

  -- Tech City (2)
  (2, 'T01', 'Ground Floor', 'CAR', 'AVAILABLE'),
  (2, 'T02', 'Ground Floor', 'CAR', 'AVAILABLE'),
  (2, 'T03', 'Ground Floor', 'CAR', 'AVAILABLE'),
  (2, 'T04', 'Ground Floor', 'CAR', 'AVAILABLE'),
  (2, 'T05', 'Ground Floor', 'CAR', 'AVAILABLE'),
  (2, 'T06', 'Level 1', 'CAR', 'AVAILABLE'),
  (2, 'T07', 'Level 1', 'CAR', 'AVAILABLE'),
  (2, 'T08', 'Level 1', 'CAR', 'AVAILABLE'),
  (2, 'BK01', 'Ground Floor', 'BIKE', 'AVAILABLE'),
  (2, 'BK02', 'Ground Floor', 'BIKE', 'MAINTENANCE'),

  -- Grand City Mall (3)
  (3, 'M01', 'Basement P1', 'CAR', 'AVAILABLE'),
  (3, 'M02', 'Basement P1', 'CAR', 'AVAILABLE'),
  (3, 'M03', 'Basement P1', 'CAR', 'AVAILABLE'),
  (3, 'M04', 'Basement P1', 'CAR', 'AVAILABLE'),
  (3, 'M05', 'Basement P1', 'CAR', 'AVAILABLE'),
  (3, 'M06', 'Basement P1', 'CAR', 'AVAILABLE'),
  (3, 'MEV1', 'Basement P1', 'EV', 'AVAILABLE'),
  (3, 'M07', 'Basement P2', 'CAR', 'AVAILABLE'),

  -- Airport Express (4)
  (4, 'AP01', 'Terminal Parking A', 'CAR', 'AVAILABLE'),
  (4, 'AP02', 'Terminal Parking A', 'CAR', 'AVAILABLE'),
  (4, 'AP03', 'Terminal Parking A', 'CAR', 'AVAILABLE'),
  (4, 'AP04', 'Terminal Parking A', 'CAR', 'AVAILABLE'),
  (4, 'AP05', 'Terminal Parking A', 'CAR', 'AVAILABLE'),
  (4, 'AP06', 'Terminal Parking A', 'CAR', 'AVAILABLE')
ON CONFLICT (location_id, slot_number) DO NOTHING;

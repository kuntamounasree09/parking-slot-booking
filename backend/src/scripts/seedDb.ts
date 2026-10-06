import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Users
    console.log('👤 Seeding users...');
    const adminPassHash = await bcrypt.hash('Admin@123', 10);
    const userPassHash = await bcrypt.hash('User@123', 10);

    const usersResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES 
        ('System Administrator', 'admin@parking.com', '+91 9876543210', $1, 'ADMIN'),
        ('Rahul Sharma', 'user@parking.com', '+91 9123456780', $2, 'USER'),
        ('Sarah Jenkins', 'sarah@parking.com', '+91 9822334455', $2, 'USER')
       ON CONFLICT (email) DO UPDATE 
        SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING id, email, role;`,
      [adminPassHash, userPassHash]
    );

    const adminUser = usersResult.rows.find((u) => u.role === 'ADMIN');
    const demoUser = usersResult.rows.find((u) => u.email === 'user@parking.com');
    const sarahUser = usersResult.rows.find((u) => u.email === 'sarah@parking.com');

    // 2. Seed Locations
    console.log('🏢 Seeding parking locations...');
    const locationsResult = await client.query(`
      INSERT INTO parking_locations (name, address, city, opening_time, closing_time, hourly_rate, is_active)
      VALUES 
        ('Downtown Central Plaza', '100 Main Street, Commercial Hub', 'Bengaluru', '06:00:00', '23:00:00', 50.00, true),
        ('Tech City Silicon Gateway', 'Tower 4, Electronic City Expressway', 'Bengaluru', '07:00:00', '22:00:00', 40.00, true),
        ('Grand City Mall Hub', 'MG Road, Metro Gate 2', 'Bengaluru', '08:00:00', '23:30:00', 60.00, true),
        ('Airport Express Terminal', 'Terminal 2 Approach, Airport Road', 'Bengaluru', '05:00:00', '23:59:00', 70.00, true)
      RETURNING id, name;
    `);

    const downtown = locationsResult.rows[0];
    const techPark = locationsResult.rows[1];
    const mall = locationsResult.rows[2];
    const airport = locationsResult.rows[3];

    // 3. Seed Slots
    console.log('🅿️ Seeding parking slots...');
    const slotInserts: { location_id: number; slot_number: string; floor: string; vehicle_type: string; status: string }[] = [];

    // Downtown (12 slots)
    ['A01', 'A02', 'A03', 'A04', 'A05', 'A06'].forEach((sn) => {
      slotInserts.push({ location_id: downtown.id, slot_number: sn, floor: 'Level 1 (Ground)', vehicle_type: 'CAR', status: 'AVAILABLE' });
    });
    ['B01', 'B02', 'B03', 'B04'].forEach((sn) => {
      slotInserts.push({ location_id: downtown.id, slot_number: sn, floor: 'Level 2 (Basement)', vehicle_type: 'CAR', status: 'AVAILABLE' });
    });
    slotInserts.push({ location_id: downtown.id, slot_number: 'EV01', floor: 'Level 1 (Ground)', vehicle_type: 'EV', status: 'AVAILABLE' });
    slotInserts.push({ location_id: downtown.id, slot_number: 'B05', floor: 'Level 2 (Basement)', vehicle_type: 'CAR', status: 'MAINTENANCE' });

    // Tech Park (10 slots)
    ['T01', 'T02', 'T03', 'T04', 'T05'].forEach((sn) => {
      slotInserts.push({ location_id: techPark.id, slot_number: sn, floor: 'Ground Floor', vehicle_type: 'CAR', status: 'AVAILABLE' });
    });
    ['T06', 'T07', 'T08'].forEach((sn) => {
      slotInserts.push({ location_id: techPark.id, slot_number: sn, floor: 'Level 1', vehicle_type: 'CAR', status: 'AVAILABLE' });
    });
    slotInserts.push({ location_id: techPark.id, slot_number: 'BK01', floor: 'Ground Floor', vehicle_type: 'BIKE', status: 'AVAILABLE' });
    slotInserts.push({ location_id: techPark.id, slot_number: 'BK02', floor: 'Ground Floor', vehicle_type: 'BIKE', status: 'MAINTENANCE' });

    // Mall (8 slots)
    ['M01', 'M02', 'M03', 'M04', 'M05', 'M06'].forEach((sn) => {
      slotInserts.push({ location_id: mall.id, slot_number: sn, floor: 'Basement P1', vehicle_type: 'CAR', status: 'AVAILABLE' });
    });
    slotInserts.push({ location_id: mall.id, slot_number: 'MEV1', floor: 'Basement P1', vehicle_type: 'EV', status: 'AVAILABLE' });
    slotInserts.push({ location_id: mall.id, slot_number: 'M07', floor: 'Basement P2', vehicle_type: 'CAR', status: 'AVAILABLE' });

    // Airport (6 slots)
    ['AP01', 'AP02', 'AP03', 'AP04', 'AP05', 'AP06'].forEach((sn) => {
      slotInserts.push({ location_id: airport.id, slot_number: sn, floor: 'Terminal Parking A', vehicle_type: 'CAR', status: 'AVAILABLE' });
    });

    const createdSlots: any[] = [];
    for (const slot of slotInserts) {
      const res = await client.query(
        `INSERT INTO parking_slots (location_id, slot_number, floor, vehicle_type, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
        [slot.location_id, slot.slot_number, slot.floor, slot.vehicle_type, slot.status]
      );
      createdSlots.push(res.rows[0]);
    }

    // 4. Seed Bookings
    console.log('📅 Seeding demonstration bookings (past, active, and upcoming)...');
    const now = new Date();

    // Active booking for demo user (started 1 hour ago, ends in 2 hours)
    const activeStart = new Date(now.getTime() - 60 * 60 * 1000);
    const activeEnd = new Date(now.getTime() + 120 * 60 * 1000);
    const activeSlot = createdSlots[0]; // Downtown A01

    await client.query(`
      INSERT INTO bookings (
        booking_code, user_id, slot_id, start_time, end_time,
        duration_minutes, hourly_rate, total_amount, vehicle_number,
        status, payment_status, payment_method, created_at
      ) VALUES (
        'PRK-ACT001', ${demoUser.id}, ${activeSlot.id}, 
        '${activeStart.toISOString()}', '${activeEnd.toISOString()}',
        180, 50.00, 150.00, 'KA-01-MJ-1024',
        'CONFIRMED', 'PAID', 'Credit Card', NOW() - INTERVAL '1 hour'
      );
    `);

    // Upcoming booking for demo user (tomorrow 10:00 AM to 1:30 PM, 3.5 hrs = 210 mins @ 40 = 140)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow.getTime() + 210 * 60 * 1000); // 3.5 hours
    const techSlot = createdSlots.find((s) => s.location_id === techPark.id);

    await client.query(`
      INSERT INTO bookings (
        booking_code, user_id, slot_id, start_time, end_time,
        duration_minutes, hourly_rate, total_amount, vehicle_number,
        status, payment_status, payment_method, created_at
      ) VALUES (
        'PRK-UPC002', ${demoUser.id}, ${techSlot.id}, 
        '${tomorrow.toISOString()}', '${tomorrowEnd.toISOString()}',
        210, 40.00, 140.00, 'KA-01-MJ-1024',
        'CONFIRMED', 'PAID', 'UPI PhonePe', NOW()
      );
    `);

    // Past completed booking for Sarah (3 days ago)
    const pastSlot = createdSlots.find((s) => s.location_id === mall.id);
    await client.query(`
      INSERT INTO bookings (
        booking_code, user_id, slot_id, start_time, end_time,
        duration_minutes, hourly_rate, total_amount, vehicle_number,
        status, payment_status, payment_method, created_at
      ) VALUES (
        'PRK-PST003', ${sarahUser.id}, ${pastSlot.id}, 
        NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days 2 hours',
        120, 60.00, 120.00, 'MH-12-AB-9988',
        'COMPLETED', 'PAID', 'Net Banking', NOW() - INTERVAL '3 days'
      );
    `);

    // Sample bookings across past 10 days for rich Recharts trends
    for (let dayOffset = 1; dayOffset <= 10; dayOffset++) {
      const slotIndex = dayOffset % createdSlots.length;
      const rate = 50.0;
      const duration = 120; // 2 hrs
      const amt = (duration / 60) * rate;
      await client.query(`
        INSERT INTO bookings (
          booking_code, user_id, slot_id, start_time, end_time,
          duration_minutes, hourly_rate, total_amount, vehicle_number,
          status, payment_status, payment_method, created_at
        ) VALUES (
          'PRK-HIST${dayOffset.toString().padStart(2, '0')}', ${sarahUser.id}, ${createdSlots[slotIndex].id},
          NOW() - INTERVAL '${dayOffset} days 2 hours', NOW() - INTERVAL '${dayOffset} days',
          ${duration}, ${rate}, ${amt}, 'DL-04-XZ-5544',
          'COMPLETED', 'PAID', 'Online Card', NOW() - INTERVAL '${dayOffset} days'
        );
      `);
    }

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully with demo users, locations, slots, and bookings!');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();

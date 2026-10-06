import { Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { BillingService } from '../services/billingService';
import { ConflictService } from '../services/conflictService';

const calculatePreviewSchema = z.object({
  locationId: z.number().int().positive(),
  startTime: z.string(),
  endTime: z.string(),
});

const createBookingSchema = z.object({
  slotId: z.number().int().positive(),
  startTime: z.string(),
  endTime: z.string(),
  vehicleNumber: z.string().min(3, 'Vehicle number is required'),
  paymentMethod: z.string().optional().default('Online Card / UPI'),
});

// Helper to generate professional booking codes
const generateBookingCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PRK-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const calculateBillPreview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = calculatePreviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { locationId, startTime, endTime } = parsed.data;

    const locRes = await query(
      'SELECT id, name, hourly_rate, opening_time, closing_time FROM parking_locations WHERE id = $1',
      [locationId]
    );

    if (locRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Parking location not found.' });
      return;
    }

    const loc = locRes.rows[0];
    const hourlyRate = parseFloat(loc.hourly_rate);

    const calculation = BillingService.calculateBill(
      startTime,
      endTime,
      hourlyRate,
      loc.opening_time,
      loc.closing_time
    );

    res.status(200).json({
      success: true,
      calculation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to calculate bill.',
    });
  }
};

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { slotId, startTime, endTime, vehicleNumber, paymentMethod } = parsed.data;

    // 1. Fetch slot & location details
    const slotRes = await query(
      `SELECT s.id, s.slot_number, s.status, s.floor, 
              l.id as location_id, l.name as location_name, l.address as location_address,
              l.hourly_rate, l.opening_time, l.closing_time, l.is_active
       FROM parking_slots s
       JOIN parking_locations l ON l.id = s.location_id
       WHERE s.id = $1`,
      [slotId]
    );

    if (slotRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Selected parking slot not found.' });
      return;
    }

    const slotData = slotRes.rows[0];

    if (!slotData.is_active) {
      res.status(400).json({ success: false, message: 'This parking location is currently inactive.' });
      return;
    }

    if (slotData.status === 'MAINTENANCE') {
      res.status(400).json({
        success: false,
        message: `Slot ${slotData.slot_number} is currently under maintenance and cannot be booked.`,
      });
      return;
    }

    // 2. Validate start time is not in the deep past (allow 5-minute grace for client submission latency)
    const startDate = new Date(startTime);
    const nowWithGrace = new Date(Date.now() - 5 * 60 * 1000);
    if (startDate < nowWithGrace) {
      res.status(400).json({
        success: false,
        message: 'Start time cannot be in the past.',
      });
      return;
    }

    // 3. Authoritative Billing Calculation
    const hourlyRate = parseFloat(slotData.hourly_rate);
    const billing = BillingService.calculateBill(
      startTime,
      endTime,
      hourlyRate,
      slotData.opening_time,
      slotData.closing_time
    );

    // 4. Double-Booking Conflict Prevention
    const conflictCheck = await ConflictService.checkSlotConflict(slotId, startTime, endTime);
    if (!conflictCheck.available) {
      const details = conflictCheck.conflictDetails;
      res.status(409).json({
        success: false,
        message: `Double-booking conflict: Slot ${slotData.slot_number} is already reserved for an overlapping period (${new Date(details!.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(details!.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}). Please select another slot or time range.`,
      });
      return;
    }

    // 5. Generate unique booking code
    let bookingCode = generateBookingCode();
    let isUnique = false;
    while (!isUnique) {
      const checkCode = await query('SELECT id FROM bookings WHERE booking_code = $1', [bookingCode]);
      if (checkCode.rows.length === 0) {
        isUnique = true;
      } else {
        bookingCode = generateBookingCode();
      }
    }

    // 6. Insert booking
    const insertSql = `
      INSERT INTO bookings (
        booking_code, user_id, slot_id, start_time, end_time,
        duration_minutes, hourly_rate, total_amount, vehicle_number,
        status, payment_status, payment_method
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'CONFIRMED', 'PAID', $10)
      RETURNING *;
    `;

    const insertRes = await query(insertSql, [
      bookingCode,
      req.user.id,
      slotId,
      billing.startTime,
      billing.endTime,
      billing.durationMinutes,
      billing.hourlyRate,
      billing.totalAmount,
      vehicleNumber.trim().toUpperCase(),
      paymentMethod,
    ]);

    const newBooking = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'Parking slot booked successfully!',
      booking: {
        ...newBooking,
        hourly_rate: parseFloat(newBooking.hourly_rate),
        total_amount: parseFloat(newBooking.total_amount),
        slot_number: slotData.slot_number,
        floor: slotData.floor,
        location_id: slotData.location_id,
        location_name: slotData.location_name,
        location_address: slotData.location_address,
        user_name: req.user.name,
        user_email: req.user.email,
        user_phone: req.user.phone,
      },
    });
  } catch (error: any) {
    console.error('[CreateBooking Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete booking reservation.',
    });
  }
};

export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { filter, locationId, date, search } = req.query;
    const isAdmin = req.user.role === 'ADMIN';

    let queryConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIdx = 1;

    // Normal users only see their own bookings
    if (!isAdmin) {
      queryConditions.push(`b.user_id = $${paramIdx++}`);
      queryParams.push(req.user.id);
    } else if (req.query.userId) {
      queryConditions.push(`b.user_id = $${paramIdx++}`);
      queryParams.push(parseInt(req.query.userId as string, 10));
    }

    // Filter status
    if (filter === 'UPCOMING') {
      queryConditions.push(`b.status = 'CONFIRMED' AND b.start_time > NOW()`);
    } else if (filter === 'ACTIVE') {
      queryConditions.push(`b.status = 'CONFIRMED' AND b.start_time <= NOW() AND b.end_time >= NOW()`);
    } else if (filter === 'COMPLETED') {
      queryConditions.push(`(b.status = 'COMPLETED' OR (b.status = 'CONFIRMED' AND b.end_time < NOW()))`);
    } else if (filter === 'CANCELLED') {
      queryConditions.push(`b.status = 'CANCELLED'`);
    }

    // Location filter
    if (locationId) {
      queryConditions.push(`s.location_id = $${paramIdx++}`);
      queryParams.push(parseInt(locationId as string, 10));
    }

    // Date filter
    if (date) {
      queryConditions.push(`DATE(b.start_time) = $${paramIdx++}`);
      queryParams.push(date as string);
    }

    // Search query (booking code or vehicle number)
    if (search) {
      queryConditions.push(`(b.booking_code ILIKE $${paramIdx} OR b.vehicle_number ILIKE $${paramIdx} OR u.name ILIKE $${paramIdx})`);
      queryParams.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.slot_number,
        s.floor,
        l.id as location_id,
        l.name as location_name,
        l.address as location_address
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN parking_slots s ON s.id = b.slot_id
      JOIN parking_locations l ON l.id = s.location_id
      ${whereClause}
      ORDER BY b.created_at DESC;
    `;

    const result = await query(sql, queryParams);

    const bookings = result.rows.map((b) => ({
      ...b,
      hourly_rate: parseFloat(b.hourly_rate),
      total_amount: parseFloat(b.total_amount),
    }));

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error: any) {
    console.error('[GetBookings Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
};

export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const bookingId = parseInt(req.params.id, 10);
    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: 'Invalid booking ID.' });
      return;
    }

    const sql = `
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.slot_number,
        s.floor,
        s.vehicle_type,
        l.id as location_id,
        l.name as location_name,
        l.address as location_address,
        l.city as location_city
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN parking_slots s ON s.id = b.slot_id
      JOIN parking_locations l ON l.id = s.location_id
      WHERE b.id = $1;
    `;

    const result = await query(sql, [bookingId]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const booking = result.rows[0];

    // Check authorization: user can only view their own booking unless ADMIN
    if (req.user.role !== 'ADMIN' && booking.user_id !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied: You cannot view this booking.' });
      return;
    }

    res.status(200).json({
      success: true,
      booking: {
        ...booking,
        hourly_rate: parseFloat(booking.hourly_rate),
        total_amount: parseFloat(booking.total_amount),
      },
    });
  } catch (error: any) {
    console.error('[GetBookingById Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve booking details.' });
  }
};

export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const bookingId = parseInt(req.params.id, 10);
    if (isNaN(bookingId)) {
      res.status(400).json({ success: false, message: 'Invalid booking ID.' });
      return;
    }

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const booking = bookingRes.rows[0];

    if (req.user.role !== 'ADMIN' && booking.user_id !== req.user.id) {
      res.status(403).json({ success: false, message: 'You do not have permission to cancel this booking.' });
      return;
    }

    if (booking.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
      return;
    }

    // Check cancellation eligibility: cannot cancel if already started or ended
    const startTime = new Date(booking.start_time);
    if (startTime <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already started or ended. Cancellations are only allowed for upcoming bookings.',
      });
      return;
    }

    const updatedRes = await query(
      `UPDATE bookings 
       SET status = 'CANCELLED', payment_status = 'REFUNDED', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *;`,
      [bookingId]
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. The parking slot has been released.',
      booking: {
        ...updatedRes.rows[0],
        hourly_rate: parseFloat(updatedRes.rows[0].hourly_rate),
        total_amount: parseFloat(updatedRes.rows[0].total_amount),
      },
    });
  } catch (error: any) {
    console.error('[CancelBooking Error]', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
};

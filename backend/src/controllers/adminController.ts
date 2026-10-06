import { Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'USER') as total_users,
        (SELECT COUNT(*) FROM parking_locations WHERE is_active = TRUE) as total_locations,
        (SELECT COUNT(*) FROM parking_slots) as total_slots,
        (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE) as today_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'CONFIRMED' AND start_time <= NOW() AND end_time >= NOW()) as active_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status != 'CANCELLED') as total_revenue
    `;

    const result = await query(statsQuery);
    const row = result.rows[0];

    const totalSlots = parseInt(row.total_slots, 10);
    const activeBookings = parseInt(row.active_bookings, 10);
    const slotUtilization = totalSlots > 0 ? Math.round((activeBookings / totalSlots) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: parseInt(row.total_users, 10),
        totalLocations: parseInt(row.total_locations, 10),
        totalSlots,
        todayBookings: parseInt(row.today_bookings, 10),
        activeBookings,
        totalRevenue: parseFloat(row.total_revenue),
        slotUtilization,
      },
    });
  } catch (error: any) {
    console.error('[GetDashboardStats Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin dashboard metrics.' });
  }
};

export const getRevenueReports = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // 1. Revenue and Bookings over the last 14 days
    const dailyQuery = `
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '13 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS date
      )
      SELECT 
        TO_CHAR(d.date, 'Mon DD') as label,
        d.date::text as raw_date,
        COALESCE(SUM(b.total_amount), 0)::numeric(10,2) as revenue,
        COUNT(b.id) as bookings
      FROM dates d
      LEFT JOIN bookings b ON (DATE(b.created_at) = d.date AND b.status != 'CANCELLED')
      GROUP BY d.date
      ORDER BY d.date ASC;
    `;
    const dailyRes = await query(dailyQuery);

    // 2. Revenue breakdown by parking location
    const locationQuery = `
      SELECT 
        l.id,
        l.name,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status != 'CANCELLED' THEN b.total_amount ELSE 0 END), 0)::numeric(10,2) as revenue
      FROM parking_locations l
      LEFT JOIN parking_slots s ON s.location_id = l.id
      LEFT JOIN bookings b ON b.slot_id = s.id
      GROUP BY l.id, l.name
      ORDER BY revenue DESC;
    `;
    const locationRes = await query(locationQuery);

    // 3. Status distribution for PieChart
    const statusQuery = `
      SELECT 
        status, 
        COUNT(*) as count 
      FROM bookings 
      GROUP BY status;
    `;
    const statusRes = await query(statusQuery);

    // 4. Slot status breakdown (Available vs Booked vs Maintenance right now)
    const slotStatusQuery = `
      SELECT 
        COUNT(CASE WHEN s.status = 'MAINTENANCE' THEN 1 END) as maintenance,
        COUNT(CASE WHEN s.status = 'AVAILABLE' AND b.id IS NOT NULL THEN 1 END) as booked,
        COUNT(CASE WHEN s.status = 'AVAILABLE' AND b.id IS NULL THEN 1 END) as available
      FROM parking_slots s
      LEFT JOIN bookings b ON (
        b.slot_id = s.id 
        AND b.status = 'CONFIRMED' 
        AND b.start_time <= NOW() 
        AND b.end_time >= NOW()
      );
    `;
    const slotStatusRes = await query(slotStatusQuery);

    res.status(200).json({
      success: true,
      dailyTrends: dailyRes.rows.map((r) => ({
        label: r.label,
        date: r.raw_date,
        revenue: parseFloat(r.revenue),
        bookings: parseInt(r.bookings, 10),
      })),
      revenueByLocation: locationRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        totalBookings: parseInt(r.total_bookings, 10),
        revenue: parseFloat(r.revenue),
      })),
      statusDistribution: statusRes.rows.map((r) => ({
        name: r.status,
        value: parseInt(r.count, 10),
      })),
      slotStatus: {
        available: parseInt(slotStatusRes.rows[0].available, 10),
        booked: parseInt(slotStatusRes.rows[0].booked, 10),
        maintenance: parseInt(slotStatusRes.rows[0].maintenance, 10),
      },
    });
  } catch (error: any) {
    console.error('[GetRevenueReports Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve revenue reports.' });
  }
};

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const usersQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.role, 
        u.created_at,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(CASE WHEN b.status != 'CANCELLED' THEN b.total_amount ELSE 0 END), 0)::numeric(10,2) as total_spent
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `;

    const result = await query(usersQuery);

    const users = result.rows.map((u) => ({
      ...u,
      booking_count: parseInt(u.booking_count, 10),
      total_spent: parseFloat(u.total_spent),
    }));

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error('[GetAllUsers Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID.' });
      return;
    }

    // Safety check: Cannot delete own admin account
    if (req.user.id === userId) {
      res.status(400).json({
        success: false,
        message: 'Security protection: You cannot delete your own active administrator account.',
      });
      return;
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({
      success: true,
      message: 'User account and associated records deleted successfully.',
    });
  } catch (error: any) {
    console.error('[DeleteUser Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

import { query } from '../config/db';

export interface ConflictCheckResult {
  available: boolean;
  conflictDetails?: {
    bookingId: number;
    bookingCode: string;
    startTime: string;
    endTime: string;
    slotNumber: string;
  };
}

export class ConflictService {
  /**
   * Checks whether a parking slot has any overlapping active bookings for the specified time interval.
   * Overlap condition: existing.start_time < requested.end_time AND existing.end_time > requested.start_time
   */
  public static async checkSlotConflict(
    slotId: number,
    startTime: Date | string,
    endTime: Date | string,
    excludeBookingId?: number
  ): Promise<ConflictCheckResult> {
    const start = new Date(startTime).toISOString();
    const end = new Date(endTime).toISOString();

    const sql = `
      SELECT b.id, b.booking_code, b.start_time, b.end_time, s.slot_number
      FROM bookings b
      JOIN parking_slots s ON s.id = b.slot_id
      WHERE b.slot_id = $1
        AND b.status != 'CANCELLED'
        AND b.start_time < $3
        AND b.end_time > $2
        AND ($4::INT IS NULL OR b.id != $4)
      LIMIT 1;
    `;

    const res = await query(sql, [slotId, start, end, excludeBookingId || null]);

    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        available: false,
        conflictDetails: {
          bookingId: row.id,
          bookingCode: row.booking_code,
          startTime: row.start_time,
          endTime: row.end_time,
          slotNumber: row.slot_number,
        },
      };
    }

    return { available: true };
  }

  /**
   * Retrieves all slots for a location with dynamic status (AVAILABLE, BOOKED, MAINTENANCE)
   * for a specific time window.
   */
  public static async getSlotsWithDynamicStatus(
    locationId: number,
    startTime?: Date | string,
    endTime?: Date | string
  ) {
    if (!startTime || !endTime) {
      // Return slots with basic status
      const sql = `
        SELECT s.*, 
          CASE 
            WHEN s.status = 'MAINTENANCE' THEN 'MAINTENANCE'
            ELSE 'AVAILABLE'
          END as current_status
        FROM parking_slots s
        WHERE s.location_id = $1
        ORDER BY s.floor ASC, s.slot_number ASC;
      `;
      const res = await query(sql, [locationId]);
      return res.rows;
    }

    const start = new Date(startTime).toISOString();
    const end = new Date(endTime).toISOString();

    const sql = `
      SELECT 
        s.*,
        CASE 
          WHEN s.status = 'MAINTENANCE' THEN 'MAINTENANCE'
          WHEN b.id IS NOT NULL THEN 'BOOKED'
          ELSE 'AVAILABLE'
        END as current_status,
        b.booking_code as conflicting_booking_code,
        b.start_time as booked_start,
        b.end_time as booked_end
      FROM parking_slots s
      LEFT JOIN bookings b ON (
        b.slot_id = s.id 
        AND b.status != 'CANCELLED'
        AND b.start_time < $3
        AND b.end_time > $2
      )
      WHERE s.location_id = $1
      ORDER BY s.floor ASC, s.slot_number ASC;
    `;

    const res = await query(sql, [locationId, start, end]);
    return res.rows;
  }
}

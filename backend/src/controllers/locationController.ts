import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';

const locationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  opening_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Format must be HH:MM or HH:MM:SS'),
  closing_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Format must be HH:MM or HH:MM:SS'),
  hourly_rate: z.number().positive('Hourly rate must be greater than 0'),
  image_url: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const getAllLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const sql = `
      SELECT 
        l.*,
        COUNT(DISTINCT s.id) AS total_slots,
        COUNT(DISTINCT CASE 
          WHEN s.status = 'AVAILABLE' AND b.id IS NULL THEN s.id 
          ELSE NULL 
        END) AS available_slots_now
      FROM parking_locations l
      LEFT JOIN parking_slots s ON s.location_id = l.id
      LEFT JOIN bookings b ON (
        b.slot_id = s.id 
        AND b.status = 'CONFIRMED'
        AND b.start_time <= NOW()
        AND b.end_time >= NOW()
      )
      ${includeInactive ? '' : 'WHERE l.is_active = TRUE'}
      GROUP BY l.id
      ORDER BY l.name ASC;
    `;

    const result = await query(sql);

    const locations = result.rows.map((row) => ({
      ...row,
      hourly_rate: parseFloat(row.hourly_rate),
      total_slots: parseInt(row.total_slots, 10),
      available_slots_now: parseInt(row.available_slots_now, 10),
    }));

    res.status(200).json({
      success: true,
      locations,
    });
  } catch (error: any) {
    console.error('[GetAllLocations Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve parking locations.' });
  }
};

export const getLocationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid location ID.' });
      return;
    }

    const sql = `
      SELECT 
        l.*,
        COUNT(DISTINCT s.id) AS total_slots,
        COUNT(DISTINCT CASE 
          WHEN s.status = 'AVAILABLE' AND b.id IS NULL THEN s.id 
          ELSE NULL 
        END) AS available_slots_now
      FROM parking_locations l
      LEFT JOIN parking_slots s ON s.location_id = l.id
      LEFT JOIN bookings b ON (
        b.slot_id = s.id 
        AND b.status = 'CONFIRMED'
        AND b.start_time <= NOW()
        AND b.end_time >= NOW()
      )
      WHERE l.id = $1
      GROUP BY l.id;
    `;

    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Parking location not found.' });
      return;
    }

    const location = {
      ...result.rows[0],
      hourly_rate: parseFloat(result.rows[0].hourly_rate),
      total_slots: parseInt(result.rows[0].total_slots, 10),
      available_slots_now: parseInt(result.rows[0].available_slots_now, 10),
    };

    res.status(200).json({ success: true, location });
  } catch (error: any) {
    console.error('[GetLocationById Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve location details.' });
  }
};

export const createLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
        errors: parsed.error.errors,
      });
      return;
    }

    const { name, address, city, opening_time, closing_time, hourly_rate, image_url, is_active } = parsed.data;

    const result = await query(
      `INSERT INTO parking_locations 
        (name, address, city, opening_time, closing_time, hourly_rate, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name.trim(),
        address.trim(),
        city.trim(),
        opening_time,
        closing_time,
        hourly_rate,
        image_url || null,
        is_active !== undefined ? is_active : true,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Parking location created successfully!',
      location: {
        ...result.rows[0],
        hourly_rate: parseFloat(result.rows[0].hourly_rate),
      },
    });
  } catch (error: any) {
    console.error('[CreateLocation Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create parking location.' });
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid location ID.' });
      return;
    }

    const parsed = locationSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { name, address, city, opening_time, closing_time, hourly_rate, image_url, is_active } = parsed.data;

    const result = await query(
      `UPDATE parking_locations
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           city = COALESCE($3, city),
           opening_time = COALESCE($4, opening_time),
           closing_time = COALESCE($5, closing_time),
           hourly_rate = COALESCE($6, hourly_rate),
           image_url = COALESCE($7, image_url),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        name ? name.trim() : null,
        address ? address.trim() : null,
        city ? city.trim() : null,
        opening_time || null,
        closing_time || null,
        hourly_rate || null,
        image_url !== undefined ? image_url : null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Parking location not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully!',
      location: {
        ...result.rows[0],
        hourly_rate: parseFloat(result.rows[0].hourly_rate),
      },
    });
  } catch (error: any) {
    console.error('[UpdateLocation Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update location.' });
  }
};

export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid location ID.' });
      return;
    }

    // Check if there are active bookings
    const activeBookings = await query(
      `SELECT b.id FROM bookings b 
       JOIN parking_slots s ON s.id = b.slot_id
       WHERE s.location_id = $1 
         AND b.status = 'CONFIRMED' 
         AND b.end_time > NOW()`,
      [id]
    );

    if (activeBookings.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete location with active or upcoming bookings. Please deactivate it instead.',
      });
      return;
    }

    await query('DELETE FROM parking_locations WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Parking location deleted successfully.',
    });
  } catch (error: any) {
    console.error('[DeleteLocation Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete location.' });
  }
};

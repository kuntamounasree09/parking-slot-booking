import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { ConflictService } from '../services/conflictService';

const slotSchema = z.object({
  slot_number: z.string().min(1, 'Slot number is required'),
  floor: z.string().min(1, 'Floor name is required'),
  vehicle_type: z.enum(['CAR', 'BIKE', 'EV']).default('CAR'),
  status: z.enum(['AVAILABLE', 'MAINTENANCE']).default('AVAILABLE'),
});

export const getSlotsByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const locationId = parseInt(req.params.locationId, 10);
    if (isNaN(locationId)) {
      res.status(400).json({ success: false, message: 'Invalid location ID.' });
      return;
    }

    const { startTime, endTime } = req.query;

    const slots = await ConflictService.getSlotsWithDynamicStatus(
      locationId,
      startTime as string | undefined,
      endTime as string | undefined
    );

    res.status(200).json({
      success: true,
      slots,
    });
  } catch (error: any) {
    console.error('[GetSlotsByLocation Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve parking slots.' });
  }
};

export const createSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const locationId = parseInt(req.params.locationId, 10);
    if (isNaN(locationId)) {
      res.status(400).json({ success: false, message: 'Invalid location ID.' });
      return;
    }

    const parsed = slotSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { slot_number, floor, vehicle_type, status } = parsed.data;

    // Check if slot number already exists at this location
    const existing = await query(
      'SELECT id FROM parking_slots WHERE location_id = $1 AND UPPER(slot_number) = UPPER($2)',
      [locationId, slot_number.trim()]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: `Slot "${slot_number}" already exists in this location.`,
      });
      return;
    }

    const result = await query(
      `INSERT INTO parking_slots (location_id, slot_number, floor, vehicle_type, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [locationId, slot_number.trim().toUpperCase(), floor.trim(), vehicle_type, status]
    );

    res.status(201).json({
      success: true,
      message: 'Parking slot added successfully!',
      slot: result.rows[0],
    });
  } catch (error: any) {
    console.error('[CreateSlot Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create parking slot.' });
  }
};

export const updateSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const slotId = parseInt(req.params.id, 10);
    if (isNaN(slotId)) {
      res.status(400).json({ success: false, message: 'Invalid slot ID.' });
      return;
    }

    const parsed = slotSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { slot_number, floor, vehicle_type, status } = parsed.data;

    const result = await query(
      `UPDATE parking_slots
       SET slot_number = COALESCE($1, slot_number),
           floor = COALESCE($2, floor),
           vehicle_type = COALESCE($3, vehicle_type),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        slot_number ? slot_number.trim().toUpperCase() : null,
        floor ? floor.trim() : null,
        vehicle_type || null,
        status || null,
        slotId,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Slot not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Slot updated successfully!',
      slot: result.rows[0],
    });
  } catch (error: any) {
    console.error('[UpdateSlot Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update parking slot.' });
  }
};

export const deleteSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const slotId = parseInt(req.params.id, 10);
    if (isNaN(slotId)) {
      res.status(400).json({ success: false, message: 'Invalid slot ID.' });
      return;
    }

    // Check for active or upcoming bookings
    const active = await query(
      `SELECT id FROM bookings WHERE slot_id = $1 AND status = 'CONFIRMED' AND end_time > NOW()`,
      [slotId]
    );

    if (active.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete slot with active or upcoming bookings. Mark it as MAINTENANCE instead.',
      });
      return;
    }

    await query('DELETE FROM parking_slots WHERE id = $1', [slotId]);

    res.status(200).json({
      success: true,
      message: 'Parking slot deleted successfully.',
    });
  } catch (error: any) {
    console.error('[DeleteSlot Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete parking slot.' });
  }
};

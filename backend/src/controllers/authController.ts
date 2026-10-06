import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
        errors: parseResult.error.errors,
      });
      return;
    }

    const { name, email, phone, password } = parseResult.data;

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertRes = await query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING id, name, email, phone, role, created_at, updated_at`,
      [name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash]
    );

    const newUser = insertRes.rows[0];
    const secret = process.env.JWT_SECRET || 'parking_slot_booking_secure_jwt_secret_token_2026_xyz';
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete registration.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
      });
      return;
    }

    const { email, password } = parseResult.data;

    const userRes = await query(
      'SELECT id, name, email, phone, password_hash, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'parking_slot_booking_secure_jwt_secret_token_2026_xyz';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    // Include quick user booking summary
    const summaryRes = await query(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'CONFIRMED' AND start_time <= NOW() AND end_time >= NOW() THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'CONFIRMED' AND start_time > NOW() THEN 1 END) as upcoming_bookings,
        COALESCE(SUM(CASE WHEN status != 'CANCELLED' THEN total_amount ELSE 0 END), 0) as total_spent
       FROM bookings 
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      user: req.user,
      stats: {
        totalBookings: parseInt(summaryRes.rows[0].total_bookings, 10),
        activeBookings: parseInt(summaryRes.rows[0].active_bookings, 10),
        upcomingBookings: parseInt(summaryRes.rows[0].upcoming_bookings, 10),
        totalSpent: parseFloat(summaryRes.rows[0].total_spent),
      },
    });
  } catch (error: any) {
    console.error('[GetMe Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { name, phone, currentPassword, newPassword } = parseResult.data;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: 'Current password is required to change password.' });
        return;
      }
      const passRes = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
      const isMatch = await bcrypt.compare(currentPassword, passRes.rows[0].password_hash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password does not match.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);
    }

    const updated = await query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           phone = COALESCE($2, phone), 
           updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, name, email, phone, role, created_at, updated_at`,
      [name || null, phone || null, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated.rows[0],
    });
  } catch (error: any) {
    console.error('[UpdateProfile Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

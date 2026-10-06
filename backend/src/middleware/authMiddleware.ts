import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { User } from '../models/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

interface JwtPayload {
  userId: number;
  email: string;
  role: 'USER' | 'ADMIN';
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid format.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'parking_slot_booking_secure_jwt_secret_token_2026_xyz';

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please log in again.',
      });
      return;
    }

    const userRes = await query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
      return;
    }

    req.user = userRes.rows[0];
    next();
  } catch (error: any) {
    console.error('[AuthMiddleware Error]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server authentication error.',
    });
  }
};

import { BillingCalculation } from '../models/types';

export class BillingService {
  /**
   * Calculates time-based parking charge with authoritative backend calculation.
   * Billing Rule:
   * durationMinutes = (endTime - startTime) in minutes
   * durationHours = round(durationMinutes / 60, 2)
   * totalAmount = round((durationMinutes / 60) * hourlyRate, 2)
   * Minimum duration = 30 minutes.
   */
  public static calculateBill(
    startTimeInput: string | Date,
    endTimeInput: string | Date,
    hourlyRate: number,
    locationOpeningTime?: string,
    locationClosingTime?: string
  ): BillingCalculation {
    const start = new Date(startTimeInput);
    const end = new Date(endTimeInput);

    if (isNaN(start.getTime())) {
      throw new Error('Invalid start date and time format.');
    }

    if (isNaN(end.getTime())) {
      throw new Error('Invalid end date and time format.');
    }

    if (end.getTime() <= start.getTime()) {
      throw new Error('End time must be later than start time.');
    }

    const durationMilliseconds = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMilliseconds / (1000 * 60));

    // Minimum parking duration rule: 30 minutes
    if (durationMinutes < 30) {
      throw new Error('Minimum parking duration is 30 minutes.');
    }

    // Maximum parking booking rule: 72 hours (prevent unrealistic reservations)
    if (durationMinutes > 72 * 60) {
      throw new Error('Maximum parking duration cannot exceed 72 hours.');
    }

    if (hourlyRate <= 0) {
      throw new Error('Hourly rate must be greater than zero.');
    }

    // Validate operational hours if provided (e.g. 06:00:00 to 23:00:00)
    if (locationOpeningTime && locationClosingTime) {
      this.validateOperationalHours(start, end, locationOpeningTime, locationClosingTime);
    }

    const durationHours = Math.round((durationMinutes / 60) * 100) / 100;
    const totalAmount = Math.round((durationMinutes / 60) * hourlyRate * 100) / 100;

    return {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes,
      durationHours,
      hourlyRate,
      totalAmount,
      formula: `₹${hourlyRate}/hr × ${durationHours} hrs = ₹${totalAmount}`,
    };
  }

  /**
   * Validates if start and end times fall within location's operational hours
   */
  private static validateOperationalHours(
    start: Date,
    end: Date,
    openingTime: string,
    closingTime: string
  ): void {
    const formatTimeStr = (date: Date) => {
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    const startTimeStr = formatTimeStr(start);
    const endTimeStr = formatTimeStr(end);

    // Standard single-day operating hours
    if (openingTime <= closingTime) {
      if (startTimeStr < openingTime || startTimeStr > closingTime) {
        throw new Error(
          `Start time (${startTimeStr.slice(0, 5)}) is outside location operating hours (${openingTime.slice(0, 5)} - ${closingTime.slice(0, 5)}).`
        );
      }
      if (endTimeStr < openingTime || endTimeStr > closingTime) {
        throw new Error(
          `End time (${endTimeStr.slice(0, 5)}) is outside location operating hours (${openingTime.slice(0, 5)} - ${closingTime.slice(0, 5)}).`
        );
      }
    }
  }
}

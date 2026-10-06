import React from 'react';
import { BillingCalculation, ParkingLocation, ParkingSlot } from '../../types';
import { Clock, IndianRupee, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface LiveBillCardProps {
  location: ParkingLocation;
  selectedSlot: ParkingSlot | null;
  calculation: BillingCalculation | null;
  vehicleNumber: string;
  setVehicleNumber: (val: string) => void;
  onConfirmBooking: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

export const LiveBillCard: React.FC<LiveBillCardProps> = ({
  location,
  selectedSlot,
  calculation,
  vehicleNumber,
  setVehicleNumber,
  onConfirmBooking,
  isSubmitting,
  error,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-base font-bold text-slate-900">Live Booking Summary</h3>
        <p className="text-xs text-slate-500">Transparent time-based calculation engine</p>
      </div>

      {/* Selected Slot Notice */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Selected Slot
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            {selectedSlot ? `${selectedSlot.slot_number} (${selectedSlot.floor})` : 'None selected'}
          </span>
        </div>
        {selectedSlot ? (
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
            {selectedSlot.vehicle_type}
          </span>
        ) : (
          <span className="text-xs text-amber-600 font-medium">Please choose a slot</span>
        )}
      </div>

      {/* Vehicle Number Input */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Vehicle Plate Number <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
          placeholder="e.g. KA-01-AB-1234"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
        />
        <p className="text-[11px] text-slate-400 mt-1">Needed for on-premise barrier verification</p>
      </div>

      {/* Time & Cost Breakdown */}
      {calculation ? (
        <div className="space-y-3 mb-6 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Duration:
            </span>
            <span className="font-bold text-slate-900">
              {calculation.durationHours} hrs ({calculation.durationMinutes} mins)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              Base Hourly Rate:
            </span>
            <span className="font-bold text-slate-900">₹{calculation.hourlyRate}/hour</span>
          </div>

          <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Total Estimated Bill
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">{calculation.formula}</span>
            </div>
            <div className="text-2xl font-black text-emerald-700">₹{calculation.totalAmount}</div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs mb-6 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Pick a valid start and end time (minimum 30 minutes) to calculate your exact bill.</span>
        </div>
      )}

      {/* Error message if any */}
      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        disabled={!selectedSlot || !calculation || !vehicleNumber.trim() || isSubmitting}
        onClick={onConfirmBooking}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 group"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Reserving Slot...</span>
          </>
        ) : (
          <>
            <span>Proceed & Confirm Booking</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
          </>
        )}
      </button>

      {/* Guarantee note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Atomic conflict lock prevents double-booking</span>
      </div>
    </div>
  );
};

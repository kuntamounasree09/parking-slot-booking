import React from 'react';
import { Booking } from '../../types';
import { Printer, CheckCircle, Car, MapPin, Calendar, Clock, IndianRupee, X } from 'lucide-react';

interface ReceiptModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedStart = new Date(booking.start_time).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const formattedEnd = new Date(booking.end_time).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity no-print"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100 z-10">
          {/* Action Header (hidden in print) */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50 no-print">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Booking Receipt
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div id="printable-receipt" className="p-8 space-y-6">
            {/* Header info */}
            <div className="text-center border-b border-dashed border-slate-300 pb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mb-2">
                <Car className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">ParkEase Smart Parking</h2>
              <p className="text-xs text-slate-500">Official Reservation & Payment Receipt</p>
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Status: {booking.status}
              </div>
            </div>

            {/* Booking Code Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Booking Reference
                </span>
                <span className="text-base font-black text-slate-900 tracking-wider">
                  {booking.booking_code}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Vehicle Reg.
                </span>
                <span className="text-sm font-black text-emerald-700">
                  {booking.vehicle_number}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location
                </span>
                <span className="font-bold text-slate-800 block">{booking.location_name}</span>
                <span className="text-[11px] text-slate-500 block truncate">{booking.location_address}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-emerald-600" /> Slot Reserved
                </span>
                <span className="text-base font-black text-slate-900 block">
                  Slot {booking.slot_number}
                </span>
                <span className="text-[11px] text-slate-500 block">{booking.floor}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Check-In Time
                </span>
                <span className="font-bold text-slate-800 block">{formattedStart}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Check-Out Time
                </span>
                <span className="font-bold text-slate-800 block">{formattedEnd}</span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-dashed border-slate-300 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Reserved Duration:</span>
                <span className="font-bold text-slate-900">{booking.duration_minutes} mins ({(booking.duration_minutes / 60).toFixed(2)} hrs)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hourly Rate:</span>
                <span className="font-bold text-slate-900">₹{booking.hourly_rate} / hr</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-bold text-slate-900">{booking.payment_method || 'Online'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-600 uppercase">{booking.payment_status}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Grand Total Paid:</span>
                <span className="text-xl font-black text-emerald-700">₹{booking.total_amount}</span>
              </div>
            </div>

            {/* Mock QR / Barcode element */}
            <div className="pt-4 border-t border-dashed border-slate-300 text-center">
              <div className="font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-1">
                |||||| | |||||||| |||| | |||||||| ||||||||
              </div>
              <p className="text-[10px] text-slate-400">
                Please present this receipt or booking code at the parking gate entrance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

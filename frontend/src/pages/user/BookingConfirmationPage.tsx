import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReceiptModal } from '../../components/booking/ReceiptModal';
import {
  CheckCircle,
  Calendar,
  Clock,
  Car,
  MapPin,
  Printer,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    bookingsApi
      .getById(parseInt(bookingId, 10))
      .then((data) => setBooking(data))
      .catch((err) => console.error('Failed to load confirmed booking', err))
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving booking confirmation..." />;
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200 my-12">
        <h3 className="text-base font-bold text-slate-800">Booking record not found</h3>
        <p className="text-xs text-slate-500 mt-1">Please return to your dashboard to review your bookings.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* SUCCESS HERO BANNER */}
      <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-white shadow-inner">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Reservation Confirmed!
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-md mx-auto">
          Your parking slot has been reserved. Please keep your booking reference ready when entering the gate.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/40 text-emerald-300 font-mono text-xs font-bold border border-emerald-400/30">
          Booking ID: {booking.booking_code}
        </div>
      </div>

      {/* CONFIRMATION SUMMARY CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Booking Summary</h2>
            <p className="text-xs text-slate-400">Time-based billing breakdown</p>
          </div>
          <button
            onClick={() => setShowReceiptModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location
            </span>
            <span className="font-bold text-slate-900 text-sm block">{booking.location_name}</span>
            <span className="text-[11px] text-slate-500 block">{booking.location_address}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-emerald-600" /> Reserved Slot
            </span>
            <span className="font-black text-slate-900 text-base block">
              Slot {booking.slot_number}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {booking.floor} • Vehicle: <strong>{booking.vehicle_number}</strong>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Start Time
            </span>
            <span className="font-bold text-slate-900 block">
              {new Date(booking.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> End Time
            </span>
            <span className="font-bold text-slate-900 block">
              {new Date(booking.end_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Duration:</span>
            <span className="font-bold text-slate-900">
              {booking.duration_minutes} minutes ({(booking.duration_minutes / 60).toFixed(2)} hours)
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Hourly Rate:</span>
            <span className="font-bold text-slate-900">₹{booking.hourly_rate} / hour</span>
          </div>
          <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-baseline">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Total Amount Paid:
            </span>
            <span className="text-2xl font-black text-emerald-700">₹{booking.total_amount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            to="/bookings"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
          >
            <span>View All My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <ReceiptModal
        booking={booking}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
};

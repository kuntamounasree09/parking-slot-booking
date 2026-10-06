import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReceiptModal } from '../../components/booking/ReceiptModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  CalendarCheck,
  Search,
  Filter,
  FileText,
  XCircle,
  AlertTriangle,
  Car,
  BookmarkPlus,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const { success, error: toastError } = useToast();

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (activeFilter !== 'ALL') {
        params.filter = activeFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const data = await bookingsApi.getAll(params);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
      toastError('Failed to fetch bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      setIsCancelling(true);
      await bookingsApi.cancel(cancellingBooking.id);
      success(`Booking ${cancellingBooking.booking_code} cancelled. Slot released.`);
      setCancellingBooking(null);
      loadBookings();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel booking.';
      toastError(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Parking Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View your booking history, download receipts, or cancel upcoming reservations.
            </p>
          </div>
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition self-start sm:self-auto"
          >
            <BookmarkPlus className="w-4 h-4" />
            Book a Slot
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code or vehicle..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <LoadingSpinner message="Loading your bookings..." />
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No reservations match your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Location & Slot</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Duration & Rate</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {bookings.map((b) => {
                    const isUpcoming = b.status === 'CONFIRMED' && new Date(b.start_time) > new Date();

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <span className="font-mono font-bold text-slate-900 block">{b.booking_code}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Plate: {b.vehicle_number}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{b.location_name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">Slot {b.slot_number} ({b.floor})</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">
                            {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{b.duration_minutes} mins ({(b.duration_minutes / 60).toFixed(1)}h)</div>
                          <div className="text-[11px] text-slate-400">₹{b.hourly_rate}/hr</div>
                        </td>
                        <td className="p-4 font-black text-emerald-700">₹{b.total_amount}</td>
                        <td className="p-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedReceipt(b)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              Receipt
                            </button>
                            {isUpcoming && (
                              <button
                                onClick={() => setCancellingBooking(b)}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        booking={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* CANCELLATION CONFIRMATION MODAL */}
      <Modal
        isOpen={!!cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        title="Cancel Parking Reservation"
        maxWidth="md"
      >
        {cancellingBooking && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cancellation Confirmation:</strong>
                <p className="mt-0.5">
                  Are you sure you want to cancel booking <strong>{cancellingBooking.booking_code}</strong> for Slot <strong>{cancellingBooking.slot_number}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Upon cancellation, your slot will be made immediately available for other drivers.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

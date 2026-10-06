import React, { useState, useEffect } from 'react';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReceiptModal } from '../../components/booking/ReceiptModal';
import { useToast } from '../../context/ToastContext';
import {
  CalendarCheck,
  Search,
  Filter,
  FileText,
  User,
  Car,
} from 'lucide-react';

export const ManageBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);

  const { success, error: toastError } = useToast();

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filter !== 'ALL') params.filter = filter;
      if (search.trim()) params.search = search.trim();
      const data = await bookingsApi.getAll(params);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load all bookings', err);
      toastError('Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!window.confirm(`Cancel booking ${booking.booking_code}? This will free the slot.`)) return;
    try {
      await bookingsApi.cancel(booking.id);
      success(`Booking ${booking.booking_code} cancelled.`);
      loadBookings();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel.';
      toastError(msg);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage All Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global view of all user reservations, occupancy records, and payments.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === tab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, code, or vehicle..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <LoadingSpinner message="Loading reservations..." />
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              No reservation records match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Ref Code</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Location & Slot</th>
                    <th className="p-4">Reserved Interval</th>
                    <th className="p-4">Duration & Bill</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 block">{b.booking_code}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{b.vehicle_number}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.user_name}</div>
                        <div className="text-[11px] text-slate-400">{b.user_email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.location_name}</div>
                        <div className="text-[11px] text-slate-400">Slot {b.slot_number} ({b.floor})</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-emerald-700">₹{b.total_amount}</div>
                        <div className="text-[11px] text-slate-400">{b.duration_minutes} mins</div>
                      </td>
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
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancelBooking(b)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ReceiptModal
        booking={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};

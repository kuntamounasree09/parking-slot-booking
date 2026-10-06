import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReceiptModal } from '../../components/booking/ReceiptModal';
import {
  CalendarCheck,
  Clock,
  IndianRupee,
  Car,
  BookmarkPlus,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, stats, refreshUser } = useAuth();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        await refreshUser();
        const allBookings = await bookingsApi.getAll();
        setRecentBookings(allBookings.slice(0, 5));

        const now = new Date();
        const active = allBookings.find((b) => {
          const s = new Date(b.start_time);
          const e = new Date(b.end_time);
          return b.status === 'CONFIRMED' && s <= now && e >= now;
        });
        setActiveBooking(active || null);
      } catch (err) {
        console.error('Failed to load user dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is what is happening with your parking reservations today.
            </p>
          </div>
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition self-start sm:self-auto"
          >
            <BookmarkPlus className="w-4 h-4" />
            Book New Slot
          </Link>
        </div>

        {/* ACTIVE SESSION BANNER (if customer is currently parked) */}
        {activeBooking && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                Active Parking Session In Progress
              </div>
              <h2 className="text-xl font-black tracking-tight">
                Slot {activeBooking.slot_number} at {activeBooking.location_name}
              </h2>
              <p className="text-xs text-emerald-100 flex items-center gap-2">
                <span>Vehicle: <strong>{activeBooking.vehicle_number}</strong></span>
                <span>•</span>
                <span>
                  Valid until {new Date(activeBooking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedReceipt(activeBooking)}
              className="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              View Active Pass
            </button>
          </div>
        )}

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            subtitle="Lifetime reservations"
            icon={CalendarCheck}
            color="emerald"
          />
          <StatCard
            title="Active Sessions"
            value={stats?.activeBookings || 0}
            subtitle="Currently parked"
            icon={Car}
            color="blue"
          />
          <StatCard
            title="Upcoming Bookings"
            value={stats?.upcomingBookings || 0}
            subtitle="Scheduled in advance"
            icon={Clock}
            color="indigo"
          />
          <StatCard
            title="Total Spent"
            value={`₹${stats?.totalSpent || 0}`}
            subtitle="Calculated exact billing"
            icon={IndianRupee}
            color="amber"
          />
        </div>

        {/* RECENT BOOKINGS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Bookings</h3>
              <p className="text-xs text-slate-500">Your recent slot reservations and billing</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View all bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading recent bookings..." />
          ) : recentBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No bookings found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You haven't reserved any parking slots yet. Find an available slot and book with fair hourly billing!
              </p>
              <Link
                to="/locations"
                className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
              >
                Find Parking Slots
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Location & Slot</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-mono font-bold text-slate-900">{b.booking_code}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.location_name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">Slot: {b.slot_number} ({b.floor})</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {b.duration_minutes} mins ({(b.duration_minutes / 60).toFixed(1)}h)
                      </td>
                      <td className="p-4 font-black text-emerald-700">₹{b.total_amount}</td>
                      <td className="p-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(b)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          Receipt
                        </button>
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { AdminDashboardStats, RevenueReportData } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { StatCard } from '../../components/dashboard/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  MapPin,
  ParkingSquare,
  CalendarCheck,
  Car,
  IndianRupee,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6'];
const SLOT_COLORS = {
  available: '#10b981',
  booked: '#f43f5e',
  maintenance: '#94a3b8',
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, revRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getRevenue(),
        ]);
        setStats(statsRes);
        setRevenueData(revRes);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading || !stats || !revenueData) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar type="admin" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner message="Loading administrator analytics..." />
        </main>
      </div>
    );
  }

  const slotPieData = [
    { name: 'Available', value: revenueData.slotStatus.available, color: SLOT_COLORS.available },
    { name: 'Occupied/Booked', value: revenueData.slotStatus.booked, color: SLOT_COLORS.booked },
    { name: 'Maintenance', value: revenueData.slotStatus.maintenance, color: SLOT_COLORS.maintenance },
  ];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Enterprise Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time parking utilization, time-based revenue analytics, and facility operations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/locations"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
            >
              + Add Location
            </Link>
            <Link
              to="/admin/revenue"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
            >
              Full Financial Report
            </Link>
          </div>
        </div>

        {/* TOP METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue}`}
            subtitle="Confirmed billing"
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Registered Users"
            value={stats.totalUsers}
            subtitle="Customer accounts"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Locations"
            value={stats.totalLocations}
            subtitle="Operational hubs"
            icon={MapPin}
            color="indigo"
          />
          <StatCard
            title="Total Slots"
            value={stats.totalSlots}
            subtitle="Across facilities"
            icon={ParkingSquare}
            color="amber"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            subtitle="Parked right now"
            icon={Car}
            color="rose"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${stats.slotUtilization}%`}
            subtitle="Current capacity"
            icon={Activity}
            color="emerald"
          />
        </div>

        {/* CHARTS ROW 1: Revenue Over Time & Bookings per Day */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Trends (AreaChart) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Revenue Trends (Past 14 Days)
                </h3>
                <p className="text-[11px] text-slate-400">Daily accrued income from confirmed reservations</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Live Data
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`₹${val}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Slot Utilization Status (PieChart) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Current Slot Utilization</h3>
              <p className="text-[11px] text-slate-400">Real-time status across all bays</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slotPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {slotPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                <span className="block text-base">{revenueData.slotStatus.available}</span>
                <span className="text-[10px] uppercase">Available</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-800 font-bold">
                <span className="block text-base">{revenueData.slotStatus.booked}</span>
                <span className="text-[10px] uppercase">Booked</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                <span className="block text-base">{revenueData.slotStatus.maintenance}</span>
                <span className="text-[10px] uppercase">Maint.</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2: Revenue by Location & Booking Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue by Location (BarChart) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Revenue Contribution by Facility</h3>
              <p className="text-[11px] text-slate-400">Cumulative earnings per parking venue</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.revenueByLocation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`₹${val}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Booking Status Lifecycle</h3>
              <p className="text-[11px] text-slate-400">Breakdown of confirmed, completed & cancelled</p>
            </div>

            <div className="space-y-3 pt-2">
              {revenueData.statusDistribution.map((st, i) => (
                <div key={st.name} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {st.name}
                  </div>
                  <span className="text-sm font-black text-slate-900">{st.value} Bookings</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

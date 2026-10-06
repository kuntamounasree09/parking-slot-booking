import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { RevenueReportData, AdminDashboardStats } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/dashboard/StatCard';
import {
  IndianRupee,
  Calendar,
  BarChart3,
  Printer,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const RevenueReportsPage: React.FC = () => {
  const [data, setData] = useState<RevenueReportData | null>(null);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getRevenue(), adminApi.getStats()])
      .then(([rev, st]) => {
        setData(rev);
        setStats(st);
      })
      .catch((err) => console.error('Failed to load financial reports', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data || !stats) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar type="admin" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner message="Generating financial reports..." />
        </main>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Revenue & Financial Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Time-based billing income, location contributions, and occupancy performance.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Generated Revenue"
            value={`₹${stats.totalRevenue}`}
            subtitle="Accrued from all bookings"
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Today's Bookings"
            value={stats.todayBookings}
            subtitle="Reservations made today"
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Active Utilization"
            value={`${stats.slotUtilization}%`}
            subtitle="Bays currently occupied"
            icon={TrendingUp}
            color="indigo"
          />
        </div>

        {/* DAILY REVENUE BAR CHART */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Revenue Timeline</h3>
              <p className="text-[11px] text-slate-400">Total billings per calendar day</p>
            </div>
            <span className="text-xs font-bold text-slate-500">14-Day View</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Daily Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BREAKDOWN BY LOCATION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Revenue Breakdown by Parking Location</h3>
            <p className="text-xs text-slate-500">Comparative financial yield across venues</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">Facility Name</th>
                  <th className="p-4">Completed / Active Bookings</th>
                  <th className="p-4">Total Revenue Contributed</th>
                  <th className="p-4 text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.revenueByLocation.map((loc) => {
                  const share =
                    stats.totalRevenue > 0
                      ? Math.round((loc.revenue / stats.totalRevenue) * 100)
                      : 0;

                  return (
                    <tr key={loc.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-900">{loc.name}</td>
                      <td className="p-4 font-medium text-slate-800">{loc.totalBookings} Reservations</td>
                      <td className="p-4 font-black text-emerald-700 text-sm">₹{loc.revenue}</td>
                      <td className="p-4 text-right font-bold text-slate-900">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

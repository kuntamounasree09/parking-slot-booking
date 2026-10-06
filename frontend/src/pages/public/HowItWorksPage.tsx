import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  IndianRupee,
  Layers,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <HelpCircle className="w-3.5 h-3.5" />
          System Guide & Specifications
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How ParkEase Works
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          A deep dive into our authoritative time-based billing calculation engine, slot concurrency conflict prevention, and booking workflow.
        </p>
      </div>

      {/* CORE BILLING RULE SECTION */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">1. Time-Based Billing Engine</h2>
            <p className="text-xs text-slate-500">Authoritative server-side calculation formula</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The system bills reservations proportionally based on the requested parking duration in minutes. Charges are strictly validated and generated on the backend to guarantee financial integrity.
        </p>

        {/* Formula Box */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Authoritative Billing Formula
          </span>
          <div className="text-lg sm:text-xl font-mono text-slate-100 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            Total Amount = round((Duration in Minutes / 60) × Hourly Rate, 2)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-2">
            <div>• Minimum booking: <strong>30 minutes</strong></div>
            <div>• Billing unit: <strong>Exact minutes</strong></div>
            <div>• Currency: <strong>Indian Rupee (₹)</strong></div>
          </div>
        </div>

        {/* Examples Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Billing Calculation Examples (At Base Rate ₹40/hr):</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Parking Duration</th>
                  <th className="p-3">Duration in Minutes</th>
                  <th className="p-3">Hourly Rate</th>
                  <th className="p-3">Mathematical Calculation</th>
                  <th className="p-3">Total Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold text-slate-800">1 Hour</td>
                  <td className="p-3">60 mins</td>
                  <td className="p-3">₹40/hr</td>
                  <td className="p-3 font-mono">(60 / 60) × 40</td>
                  <td className="p-3 font-bold text-emerald-700">₹40</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">2 Hours</td>
                  <td className="p-3">120 mins</td>
                  <td className="p-3">₹40/hr</td>
                  <td className="p-3 font-mono">(120 / 60) × 40</td>
                  <td className="p-3 font-bold text-emerald-700">₹80</td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="p-3 font-semibold text-emerald-950">3.5 Hours (3 hrs 30 mins)</td>
                  <td className="p-3 font-semibold text-emerald-950">210 mins</td>
                  <td className="p-3">₹40/hr</td>
                  <td className="p-3 font-mono">(210 / 60) × 40</td>
                  <td className="p-3 font-black text-emerald-700">₹140</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">1 Hour 15 Mins (1.25 hrs)</td>
                  <td className="p-3">75 mins</td>
                  <td className="p-3">₹40/hr</td>
                  <td className="p-3 font-mono">(75 / 60) × 40</td>
                  <td className="p-3 font-bold text-emerald-700">₹50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DOUBLE BOOKING CONFLICT PREVENTION */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">2. Concurrency & Double-Booking Prevention</h2>
            <p className="text-xs text-slate-500">Atomic time interval intersection verification</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          A fundamental requirement of real-world parking operations is eliminating double bookings. Two customers cannot book the same slot if their time intervals overlap even by one minute.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600" /> Overlapping Intervals (Rejected by 409 Conflict)
            </h4>
            <p><strong>Booking 1:</strong> 10:00 AM – 12:00 PM</p>
            <p><strong>Attempted Booking 2:</strong> 11:00 AM – 1:00 PM</p>
            <p className="text-[11px] text-rose-700 pt-2 border-t border-rose-200">
              Overlap detected: 11:00 AM to 12:00 PM is contested. The second user is immediately notified and blocked.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Consecutive Intervals (Allowed)
            </h4>
            <p><strong>Booking 1:</strong> 10:00 AM – 12:00 PM</p>
            <p><strong>Booking 2:</strong> 12:00 PM – 2:00 PM</p>
            <p className="text-[11px] text-emerald-700 pt-2 border-t border-emerald-200">
              Zero overlap: Booking 2 starts precisely when Booking 1 concludes. This is fully permissible.
            </p>
          </div>
        </div>
      </div>

      {/* CANCELLATION RULES */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">3. Cancellation & Slot Release Policy</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          • Users may cancel any <strong>Upcoming</strong> reservation prior to the scheduled start time.
          <br />
          • Once the scheduled parking window starts or completes, cancellation is disallowed.
          <br />
          • When cancelled, the reservation status is updated to <code className="text-rose-600 font-mono">CANCELLED</code>, instantly freeing the slot for other customers.
        </p>

        <div className="pt-4">
          <Link
            to="/locations"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition"
          >
            Start Booking Parking Now &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

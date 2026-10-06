import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                <Car className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Park<span className="text-emerald-400">Ease</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise smart parking management and automated slot reservation platform with exact time-based fair billing.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                No Overbooking
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                Fair Hourly Rates
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-emerald-400 transition">
                  Parking Locations
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Booking Rules */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Billing Engine</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>⏱️ Exact minute-calculated durations</li>
              <li>⚡ ₹40 - ₹70 / hr base location rates</li>
              <li>🔒 Instant cancellation & full slot release</li>
              <li>🛡️ Zero double-booking algorithm</li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Academic Project</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Full Stack Web Development B.Tech Capstone Project. Built with React, Vite, TypeScript, Express, and PostgreSQL.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-emerald-400 border border-slate-700">
              <Zap className="w-3.5 h-3.5" />
              Production Ready Stack
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ParkEase. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Academic Evaluation with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> and Full Stack Engineering
          </p>
        </div>
      </div>
    </footer>
  );
};

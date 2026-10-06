import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { locationsApi } from '../../services/api';
import { ParkingLocation } from '../../types';
import {
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  Zap,
  Star,
  Layers,
  Search,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [calcHours, setCalcHours] = useState<number>(3.5);
  const [calcRate, setCalcRate] = useState<number>(40);

  useEffect(() => {
    locationsApi
      .getAll()
      .then((data) => setLocations(data.slice(0, 3)))
      .catch((err) => console.error('Failed to load preview locations', err));
  }, []);

  const estimatedCost = Math.round(calcHours * calcRate * 100) / 100;

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Smart Parking System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Smart Parking. <br />
                <span className="text-emerald-600">Simple Booking.</span> <br />
                Fair Billing.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Eliminate parking stress with real-time slot availability, instant guaranteed reservations, and minute-accurate proportional billing. Never pay for time you don't use.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/locations"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <span>Book a Parking Slot</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
                >
                  <span>View How It Works</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Guaranteed Slot</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">0 Overbook</div>
                  <div className="text-xs text-slate-500 font-medium">Conflict Engine</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">₹40/hr</div>
                  <div className="text-xs text-slate-500 font-medium">Base Fair Pricing</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Billing Estimator Hero Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Live Billing Simulator</h3>
                      <p className="text-[11px] text-slate-500">Test the time calculation engine</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase">
                    Interactive
                  </span>
                </div>

                <div className="space-y-6 my-6">
                  {/* Slider: Duration */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                      <span>Parking Duration:</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {calcHours} Hours ({calcHours * 60} mins)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="8"
                      step="0.5"
                      value={calcHours}
                      onChange={(e) => setCalcHours(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>30 mins (Min)</span>
                      <span>4 hrs</span>
                      <span>8 hrs</span>
                    </div>
                  </div>

                  {/* Hourly Rate Selector */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                      <span>Location Base Rate:</span>
                      <span className="text-slate-900">₹{calcRate}/hour</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[40, 50, 60].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setCalcRate(rate)}
                          className={`py-2 text-xs font-bold rounded-xl border transition ${
                            calcRate === rate
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ₹{rate}/hr
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Box */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Billing Formula:</span>
                      <span className="font-mono text-emerald-400">
                        {calcHours} hrs × ₹{calcRate}/hr
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                      <span className="text-xs uppercase font-bold text-slate-300">
                        Calculated Total:
                      </span>
                      <span className="text-3xl font-black text-emerald-400">
                        ₹{estimatedCost}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/locations"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider text-center block transition shadow-md"
                >
                  Find Available Slots Now &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Why ParkEase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Modern Urban Drivers
          </h2>
          <p className="text-sm text-slate-500">
            Say goodbye to driving in circles searching for parking. We provide certainty, precision, and fair pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Zero Overbooking Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our backend conflict detection engine prevents slot overlaps. If a slot is booked from 10:00 to 12:00, no one else can book overlapping hours.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Time-Based Fair Billing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Charges are strictly calculated based on the duration you reserve. First hour and proportional additions are clearly computed before checkout.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive Slot Matrix</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View real-time slot layout maps color-coded with green available, red occupied, and gray maintenance states. Select your exact spot.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Easy 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How to Book Your Slot in Minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Select Location',
                desc: 'Browse prime parking venues across tech parks, malls, and metro stations.',
              },
              {
                step: '02',
                title: 'Pick Date & Time',
                desc: 'Choose your entry and exit time. Our billing engine computes the exact cost.',
              },
              {
                step: '03',
                title: 'Choose Visual Slot',
                desc: 'Pick your preferred available slot (A01, B02, EV charging) on the lot canvas.',
              },
              {
                step: '04',
                title: 'Instant Confirmation',
                desc: 'Receive your unique booking code and printable entry gate receipt instantly.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 relative">
                <span className="text-3xl font-black text-emerald-500/30 mb-4 block font-mono">
                  {item.step}
                </span>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARKING LOCATIONS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Prime Venues
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Parking Locations
            </h2>
          </div>
          <Link
            to="/locations"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Explore all locations &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{loc.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {loc.address}, {loc.city}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    ₹{loc.hourly_rate}/hr
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hours</span>
                    <span className="font-bold">{loc.opening_time.slice(0, 5)} - {loc.closing_time.slice(0, 5)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Capacity</span>
                    <span className="font-bold">{loc.total_slots || 12} Slots</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/locations/${loc.id}/slots`}
                  className="w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl text-center block transition shadow-sm"
                >
                  Select & Reserve Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-emerald-700 to-teal-600 rounded-3xl p-8 sm:p-14 text-white text-center shadow-xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Experience Hassle-Free Parking?
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            Create an account or login to view available slots across all parking hubs with automatic time billing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-white text-emerald-800 font-extrabold text-sm shadow hover:bg-emerald-50 transition"
            >
              Register Free Account
            </Link>
            <Link
              to="/locations"
              className="px-8 py-3.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 border border-emerald-400/40 text-white font-bold text-sm transition"
            >
              Browse Parking Locations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { locationsApi } from '../../services/api';
import { ParkingLocation } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  MapPin,
  Clock,
  Car,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    locationsApi
      .getAll()
      .then((data) => setLocations(data))
      .catch((err) => console.error('Failed to fetch locations', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.address.toLowerCase().includes(search.toLowerCase()) ||
      loc.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Active Facilities
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Parking Locations & Hubs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select a parking facility to check live slot availability and reserve your spot.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue or address..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading parking locations..." />
      ) : filteredLocations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No matching parking locations</h3>
          <p className="text-xs text-slate-400 mt-1">Try refining your search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{loc.address}, {loc.city}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 shrink-0">
                    ₹{loc.hourly_rate}/hr
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" /> Operational
                    </span>
                    <span className="font-bold text-slate-800">
                      {loc.opening_time.slice(0, 5)} - {loc.closing_time.slice(0, 5)}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Car className="w-3 h-3 text-emerald-600" /> Availability
                    </span>
                    <span className="font-bold text-emerald-700">
                      {loc.available_slots_now ?? loc.total_slots ?? 0} / {loc.total_slots || 0} Slots
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/locations/${loc.id}/slots`}
                  className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2 transition shadow-sm group-hover:shadow-md"
                >
                  <span>Select Slot & Book</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

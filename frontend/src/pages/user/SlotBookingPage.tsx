import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { locationsApi, slotsApi, bookingsApi } from '../../services/api';
import { ParkingLocation, ParkingSlot, BillingCalculation } from '../../types';
import { SlotGrid } from '../../components/booking/SlotGrid';
import { LiveBillCard } from '../../components/booking/LiveBillCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

export const SlotBookingPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [location, setLocation] = useState<ParkingLocation | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  // Date and Time range states
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);

  // Default times: next hour to next hour + 2
  const getDefaultStartTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return `${String(d.getHours()).padStart(2, '0')}:00`;
  };

  const getDefaultEndTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 3, 30, 0, 0); // 2.5 hours duration
    return `${String(d.getHours()).padStart(2, '0')}:30`;
  };

  const [startTime, setStartTime] = useState<string>(getDefaultStartTime());
  const [endTime, setEndTime] = useState<string>(getDefaultEndTime());
  const [vehicleNumber, setVehicleNumber] = useState<string>('');

  // Live bill calculation
  const [calculation, setCalculation] = useState<BillingCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSlotsLoading, setIsSlotsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Construct ISO timestamps
  const getFullTimestamp = (date: string, time: string) => {
    return new Date(`${date}T${time}:00`).toISOString();
  };

  // 1. Load Location
  useEffect(() => {
    if (!locationId) return;
    const locId = parseInt(locationId, 10);
    locationsApi
      .getById(locId)
      .then((data) => setLocation(data))
      .catch((err) => {
        console.error('Failed to load location', err);
        toastError('Failed to load parking location details.');
      });
  }, [locationId]);

  // 2. Fetch Slots & Dynamic Availability when time or location changes
  useEffect(() => {
    if (!locationId || !bookingDate || !startTime || !endTime) return;
    const locId = parseInt(locationId, 10);

    const startIso = getFullTimestamp(bookingDate, startTime);
    const endIso = getFullTimestamp(bookingDate, endTime);

    // Validate if end > start
    if (new Date(endIso) <= new Date(startIso)) {
      setErrorMessage('End time must be after start time.');
      setCalculation(null);
      return;
    }

    setErrorMessage(null);
    setIsSlotsLoading(true);

    slotsApi
      .getByLocation(locId, startIso, endIso)
      .then((data) => {
        setSlots(data);
        // If current selected slot is booked in the new interval, deselect it
        if (selectedSlot) {
          const fresh = data.find((s) => s.id === selectedSlot.id);
          if (!fresh || (fresh.current_status || fresh.status) !== 'AVAILABLE') {
            setSelectedSlot(null);
          }
        }
      })
      .catch((err) => console.error('Failed to load slots', err))
      .finally(() => setIsSlotsLoading(false));

    // Calculate live bill preview from backend
    if (isAuthenticated) {
      setIsCalculating(true);
      bookingsApi
        .calculatePreview({
          locationId: locId,
          startTime: startIso,
          endTime: endIso,
        })
        .then((calc) => {
          setCalculation(calc);
          setErrorMessage(null);
        })
        .catch((err) => {
          const msg = err.response?.data?.message || 'Invalid time interval.';
          setErrorMessage(msg);
          setCalculation(null);
        })
        .finally(() => setIsCalculating(false));
    } else {
      // Local preview if not logged in yet
      const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
      const mins = Math.round(diffMs / 60000);
      const hours = Math.round((mins / 60) * 100) / 100;
      const rate = location?.hourly_rate || 40;
      setCalculation({
        startTime: startIso,
        endTime: endIso,
        durationMinutes: mins,
        durationHours: hours,
        hourlyRate: rate,
        totalAmount: Math.round((mins / 60) * rate * 100) / 100,
        formula: `₹${rate}/hr × ${hours} hrs = ₹${Math.round((mins / 60) * rate * 100) / 100}`,
      });
    }
  }, [locationId, bookingDate, startTime, endTime, location?.hourly_rate, isAuthenticated]);

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      toastError('Please sign in to complete your reservation.');
      navigate(`/login?redirect=/locations/${locationId}/slots`);
      return;
    }

    if (!selectedSlot) {
      toastError('Please choose an available parking slot from the layout.');
      return;
    }

    if (!vehicleNumber.trim()) {
      toastError('Please enter your vehicle plate number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const startIso = getFullTimestamp(bookingDate, startTime);
      const endIso = getFullTimestamp(bookingDate, endTime);

      const result = await bookingsApi.create({
        slotId: selectedSlot.id,
        startTime: startIso,
        endTime: endIso,
        vehicleNumber: vehicleNumber.trim(),
        paymentMethod: 'Online UPI / Card',
      });

      success(`Booking ${result.booking.booking_code} confirmed successfully!`);
      navigate(`/bookings/confirmation/${result.booking.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete booking.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location) {
    return <LoadingSpinner message="Loading parking venue..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/locations" className="hover:text-slate-900 transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Locations
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{location.name}</span>
      </div>

      {/* Location Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {location.name}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {location.address}, {location.city}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Operating: {location.opening_time.slice(0, 5)} - {location.closing_time.slice(0, 5)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black">
            Base Rate: ₹{location.hourly_rate}/hour
          </div>
        </div>
      </div>

      {/* Main Booking Workspace: Left = Date/Time Picker + Visual Slot Grid, Right = Live Bill Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Date & Time Interval Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Step 1: Select Parking Date & Time
              </h2>
              <span className="text-[11px] text-slate-400">Min. 30 minutes duration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Entry Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exit Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick time add buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Quick Duration:</span>
              {[
                { label: '+1 Hour', mins: 60 },
                { label: '+2 Hours', mins: 120 },
                { label: '+3.5 Hours', mins: 210 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => {
                    const [h, m] = startTime.split(':').map(Number);
                    const totalMins = h * 60 + m + btn.mins;
                    const newH = Math.floor(totalMins / 60) % 24;
                    const newM = totalMins % 60;
                    setEndTime(
                      `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
                    );
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Interactive Slot Layout */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Step 2: Choose Available Parking Slot
              </h2>
              <span className="text-xs text-slate-500">
                Live availability for {startTime} – {endTime}
              </span>
            </div>

            <SlotGrid
              slots={slots}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              isLoading={isSlotsLoading}
            />
          </div>
        </div>

        {/* Right Column: Live Bill Summary */}
        <div className="lg:col-span-4">
          <LiveBillCard
            location={location}
            selectedSlot={selectedSlot}
            calculation={calculation}
            vehicleNumber={vehicleNumber}
            setVehicleNumber={setVehicleNumber}
            onConfirmBooking={handleConfirmBooking}
            isSubmitting={isSubmitting}
            error={errorMessage}
          />
        </div>
      </div>
    </div>
  );
};

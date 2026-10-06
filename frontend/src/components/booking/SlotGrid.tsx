import React from 'react';
import { ParkingSlot } from '../../types';
import { Car, Bike, Zap, Wrench, CheckCircle, Ban } from 'lucide-react';

interface SlotGridProps {
  slots: ParkingSlot[];
  selectedSlotId: number | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  isLoading?: boolean;
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  isLoading,
}) => {
  // Group slots by floor
  const floors = Array.from(new Set(slots.map((s) => s.floor || 'Ground Floor'))).sort();

  const getVehicleIcon = (type: string) => {
    if (type === 'EV') return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    if (type === 'BIKE') return <Bike className="w-3.5 h-3.5 text-blue-500" />;
    return <Car className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Visual Legend Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Slot Status:</span>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-emerald-500 border border-emerald-600 shadow-sm" />
            <span className="text-slate-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-rose-500 border border-rose-600 shadow-sm" />
            <span className="text-slate-700">Booked (Occupied)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-blue-600 border border-blue-700 ring-2 ring-blue-300 shadow-sm" />
            <span className="text-slate-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-slate-300 border border-slate-400 shadow-sm" />
            <span className="text-slate-700">Maintenance</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center animate-pulse">
          <div className="w-8 h-8 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Checking live slot availability...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
          No parking slots registered for this location yet.
        </div>
      ) : (
        floors.map((floor) => {
          const floorSlots = slots.filter((s) => (s.floor || 'Ground Floor') === floor);

          return (
            <div key={floor} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {floor}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {floorSlots.filter((s) => (s.current_status || s.status) === 'AVAILABLE').length} of {floorSlots.length} available
                </span>
              </div>

              {/* Slot Grid Canvas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {floorSlots.map((slot) => {
                  const status = slot.current_status || slot.status;
                  const isSelected = selectedSlotId === slot.id;
                  const isAvailable = status === 'AVAILABLE';
                  const isBooked = status === 'BOOKED';
                  const isMaintenance = status === 'MAINTENANCE';

                  let buttonStyles = 'border text-slate-800';

                  if (isSelected) {
                    buttonStyles =
                      'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-200 scale-105 shadow-md z-10';
                  } else if (isAvailable) {
                    buttonStyles =
                      'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 hover:scale-105 cursor-pointer shadow-sm';
                  } else if (isBooked) {
                    buttonStyles =
                      'bg-rose-50 text-rose-800 border-rose-200 opacity-80 cursor-not-allowed';
                  } else if (isMaintenance) {
                    buttonStyles =
                      'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onSelectSlot(slot)}
                      title={
                        isAvailable
                          ? `Click to select slot ${slot.slot_number}`
                          : isBooked
                          ? `Slot ${slot.slot_number} is already booked for this time period`
                          : `Slot ${slot.slot_number} is in maintenance`
                      }
                      className={`relative flex flex-col items-center justify-between p-3.5 rounded-xl transition duration-200 h-28 ${buttonStyles}`}
                    >
                      {/* Top icon and slot type */}
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                          {slot.vehicle_type}
                        </span>
                        <div className="p-1 rounded-md bg-white/60">
                          {getVehicleIcon(slot.vehicle_type)}
                        </div>
                      </div>

                      {/* Slot Number */}
                      <div className="text-lg font-black tracking-wider my-auto">
                        {slot.slot_number}
                      </div>

                      {/* Bottom Status pill */}
                      <div className="w-full flex items-center justify-center text-[10px] font-bold">
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-white">
                            <CheckCircle className="w-3 h-3" /> Selected
                          </span>
                        ) : isAvailable ? (
                          <span className="text-emerald-700">Open</span>
                        ) : isBooked ? (
                          <span className="flex items-center gap-1 text-rose-600">
                            <Ban className="w-2.5 h-2.5" /> Booked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Wrench className="w-2.5 h-2.5" /> Maint.
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

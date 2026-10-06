import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { locationsApi, slotsApi } from '../../services/api';
import { ParkingLocation, ParkingSlot } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  ParkingSquare,
  Plus,
  Wrench,
  Trash2,
  Car,
  Bike,
  Zap,
  Filter,
} from 'lucide-react';

export const ManageSlotsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);

  const [formData, setFormData] = useState({
    slot_number: '',
    floor: 'Level 1 (Ground)',
    vehicle_type: 'CAR' as 'CAR' | 'BIKE' | 'EV',
    status: 'AVAILABLE' as 'AVAILABLE' | 'MAINTENANCE',
  });

  const { success, error: toastError } = useToast();

  useEffect(() => {
    locationsApi.getAll().then((data) => {
      setLocations(data);
      const urlLocId = searchParams.get('locationId');
      if (urlLocId) {
        setSelectedLocationId(parseInt(urlLocId, 10));
      } else if (data.length > 0) {
        setSelectedLocationId(data[0].id);
      }
    });
  }, []);

  const loadSlots = async (locId: number) => {
    try {
      setIsLoading(true);
      const data = await slotsApi.getByLocation(locId);
      setSlots(data);
    } catch (err) {
      console.error('Failed to load slots', err);
      toastError('Failed to load slots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLocationId) {
      loadSlots(selectedLocationId);
    }
  }, [selectedLocationId]);

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setFormData({
      slot_number: '',
      floor: 'Level 1 (Ground)',
      vehicle_type: 'CAR',
      status: 'AVAILABLE',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId) return;

    try {
      if (editingSlot) {
        await slotsApi.update(editingSlot.id, formData);
        success(`Slot ${formData.slot_number} updated.`);
      } else {
        await slotsApi.create(selectedLocationId, formData);
        success(`New slot ${formData.slot_number} created.`);
      }
      setModalOpen(false);
      loadSlots(selectedLocationId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save slot.';
      toastError(msg);
    }
  };

  const handleToggleMaintenance = async (slot: ParkingSlot) => {
    try {
      const newStatus = slot.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
      await slotsApi.update(slot.id, { status: newStatus });
      success(`Slot ${slot.slot_number} set to ${newStatus}.`);
      if (selectedLocationId) loadSlots(selectedLocationId);
    } catch (err: any) {
      toastError('Failed to update slot status.');
    }
  };

  const handleDelete = async (slot: ParkingSlot) => {
    if (!window.confirm(`Delete slot ${slot.slot_number}?`)) return;
    try {
      await slotsApi.delete(slot.id);
      success(`Slot ${slot.slot_number} removed.`);
      if (selectedLocationId) loadSlots(selectedLocationId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete slot.';
      toastError(msg);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Parking Slots
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add individual slots, assign vehicle types, and toggle maintenance modes.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            disabled={!selectedLocationId}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>

        {/* Location selector dropdown bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Select Facility:</span>
          </div>

          <select
            value={selectedLocationId || ''}
            onChange={(e) => {
              const id = parseInt(e.target.value, 10);
              setSelectedLocationId(id);
              setSearchParams({ locationId: String(id) });
            }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city})
              </option>
            ))}
          </select>
        </div>

        {/* Slots Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <LoadingSpinner message="Loading parking slots..." />
          ) : slots.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              No slots configured for this location yet. Click "Add Slot" above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Slot Number</th>
                    <th className="p-4">Floor / Zone</th>
                    <th className="p-4">Vehicle Type</th>
                    <th className="p-4">Base Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {slots.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-mono font-black text-slate-900 text-sm">{s.slot_number}</td>
                      <td className="p-4 font-medium text-slate-800">{s.floor}</td>
                      <td className="p-4 font-bold text-slate-700 uppercase flex items-center gap-1.5 mt-1">
                        {s.vehicle_type === 'EV' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        {s.vehicle_type === 'BIKE' && <Bike className="w-3.5 h-3.5 text-blue-500" />}
                        {s.vehicle_type === 'CAR' && <Car className="w-3.5 h-3.5 text-slate-500" />}
                        {s.vehicle_type}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleMaintenance(s)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              s.status === 'AVAILABLE'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {s.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* CREATE SLOT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Parking Slot"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Slot Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slot_number}
              onChange={(e) => setFormData({ ...formData, slot_number: e.target.value.toUpperCase() })}
              placeholder="e.g. A07, B12, EV02"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Floor / Level Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              placeholder="e.g. Level 1 (Ground), Basement P1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vehicle Type
              </label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike / Two-Wheeler</option>
                <option value="EV">EV (Electric Vehicle)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
            >
              Save Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

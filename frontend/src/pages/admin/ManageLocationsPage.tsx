import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { locationsApi } from '../../services/api';
import { ParkingLocation } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ParkingSquare,
  CheckCircle,
  XCircle,
  IndianRupee,
} from 'lucide-react';

export const ManageLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<ParkingLocation | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Bengaluru',
    opening_time: '06:00:00',
    closing_time: '23:00:00',
    hourly_rate: 40,
    is_active: true,
  });

  const { success, error: toastError } = useToast();

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await locationsApi.getAll(true);
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations', err);
      toastError('Failed to load parking locations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setFormData({
      name: '',
      address: '',
      city: 'Bengaluru',
      opening_time: '06:00:00',
      closing_time: '23:00:00',
      hourly_rate: 40,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (loc: ParkingLocation) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      opening_time: loc.opening_time.length === 5 ? `${loc.opening_time}:00` : loc.opening_time,
      closing_time: loc.closing_time.length === 5 ? `${loc.closing_time}:00` : loc.closing_time,
      hourly_rate: loc.hourly_rate,
      is_active: loc.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLoc) {
        await locationsApi.update(editingLoc.id, formData);
        success(`Location "${formData.name}" updated successfully.`);
      } else {
        await locationsApi.create(formData);
        success(`New location "${formData.name}" added successfully.`);
      }
      setModalOpen(false);
      loadLocations();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Operation failed.';
      toastError(msg);
    }
  };

  const handleDelete = async (loc: ParkingLocation) => {
    if (!window.confirm(`Are you sure you want to delete "${loc.name}"?`)) return;
    try {
      await locationsApi.delete(loc.id);
      success(`Location "${loc.name}" deleted.`);
      loadLocations();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete location.';
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
              Manage Parking Locations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure operating hours, hourly base rates, and facility status.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Location
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading parking facilities..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {loc.address}, {loc.city}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        loc.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {loc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Rate</span>
                      <span className="font-black text-slate-900">₹{loc.hourly_rate} / hr</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Hours</span>
                      <span className="font-semibold text-slate-800">
                        {loc.opening_time.slice(0, 5)} - {loc.closing_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/admin/slots?locationId=${loc.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
                  >
                    <ParkingSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Manage Slots
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(loc)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Location"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(loc)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLoc ? 'Edit Parking Location' : 'Add Parking Location'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Metro Square Transit Parking"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 124 Station Road"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bengaluru"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Base Hourly Rate (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Opening Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.opening_time.slice(0, 5)}
                onChange={(e) => setFormData({ ...formData, opening_time: `${e.target.value}:00` })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Closing Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.closing_time.slice(0, 5)}
                onChange={(e) => setFormData({ ...formData, closing_time: `${e.target.value}:00` })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Facility is actively open for bookings
            </label>
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
              {editingLoc ? 'Update Location' : 'Create Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

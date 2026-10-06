import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  MapPin,
  ParkingSquare,
  Users,
  BarChart3,
  BookmarkPlus,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  type: 'user' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const { user } = useAuth();

  const userLinks = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Book a Slot', to: '/locations', icon: BookmarkPlus },
    { name: 'My Bookings', to: '/bookings', icon: CalendarCheck },
    { name: 'Profile & Security', to: '/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Admin Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Locations', to: '/admin/locations', icon: MapPin },
    { name: 'Manage Slots', to: '/admin/slots', icon: ParkingSquare },
    { name: 'All Bookings', to: '/admin/bookings', icon: CalendarCheck },
    { name: 'User Management', to: '/admin/users', icon: Users },
    { name: 'Revenue Reports', to: '/admin/revenue', icon: BarChart3 },
  ];

  const links = type === 'admin' ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              type === 'admin'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-800 truncate">{user?.name}</h4>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                type === 'admin' ? 'text-indigo-600' : 'text-emerald-600'
              }`}
            >
              {type === 'admin' && <ShieldAlert className="w-3 h-3" />}
              {user?.role} Portal
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {type === 'admin' ? 'Administration' : 'Quick Menu'}
          </div>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard' || item.to === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? type === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer info box */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">
          Logged in as <strong className="text-slate-600">{user?.email}</strong>
        </p>
      </div>
    </aside>
  );
};

import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Layers,
  Calendar,
  CreditCard,
  MessageSquare,
  Settings,
  ArrowLeft,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Workers', path: '/admin/workers', icon: ShieldCheck },
    { label: 'Services', path: '/admin/services', icon: Layers },
    { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Top Admin Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center">
                WORK<span className="text-brand-400">ZO</span>
                <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase">
                  Admin Console
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block text-xs text-slate-400">
              Logged in as <strong className="text-white">{user?.name || 'Administrator'}</strong>
            </span>
            <Link
              to="/"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to App
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 shadow-xl sticky top-24 space-y-4">
              <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Admin Navigation
              </div>
              <nav className="space-y-1">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 mr-3 text-slate-400" />
                      {item.label}
                    </NavLink>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-left"
                >
                  <LogOut className="w-4 h-4 mr-3 text-rose-400" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Admin Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

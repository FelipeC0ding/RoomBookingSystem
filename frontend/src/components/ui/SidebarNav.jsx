import React from 'react';
import { Calendar, User, Settings, LogOut, Shield, ChevronRight } from 'lucide-react';
import Badge from './Badge';

/**
 * Asymmetric Sidebar / Navigation Header for workspace layouts.
 */
export function SidebarNav({
  activePage = 'menu',
  userRole = 'STANDARD',
  userConfirmed = false,
  onNavigate,
  onLogout
}) {
  return (
    <aside className="w-full md:w-64 bg-[#0d1117] border-r border-[#21262d] flex flex-col justify-between p-5 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#21262d] mb-6">
          <div className="w-8 h-8 rounded-sm bg-amber-500 text-slate-950 flex items-center justify-center font-display font-bold text-base shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
            RB
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-sm tracking-tight text-slate-100 uppercase">
              Room<span className="text-amber-500">Booking</span>
            </h1>
            <span className="text-[10px] font-display text-slate-500 uppercase tracking-widest">
              Workspace v2.4
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 p-3 bg-[#121721] border border-[#21262d] rounded-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-display uppercase tracking-wider text-slate-400">Account Status</span>
            <Badge variant={userConfirmed ? "emerald" : "amber"} size="sm">
              {userConfirmed ? "Verified" : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 font-display">
            <span>Role</span>
            <span className="font-semibold text-amber-400">{userRole}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-display font-medium uppercase tracking-wider text-slate-500 px-2 mb-1">
            System Modules
          </span>

          <button
            onClick={() => onNavigate('menu')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-display font-medium transition-all ${
              activePage === 'menu'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161b22] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar size={15} />
              <span>Schedule Matrix</span>
            </div>
            {activePage === 'menu' && <ChevronRight size={14} />}
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-display font-medium transition-all ${
              activePage === 'profile'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161b22] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User size={15} />
              <span>My Profile</span>
            </div>
            {activePage === 'profile' && <ChevronRight size={14} />}
          </button>

          {userRole === 'ADMIN' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-display font-medium transition-all ${
                activePage === 'admin'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161b22] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield size={15} />
                <span>Admin Operations</span>
              </div>
              {activePage === 'admin' && <ChevronRight size={14} />}
            </button>
          )}
        </nav>
      </div>

      {/* Footer / Sign Out */}
      <div className="pt-4 border-t border-[#21262d] mt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-display text-red-400 hover:bg-red-950/40 hover:border hover:border-red-900/60 transition-all"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default SidebarNav;

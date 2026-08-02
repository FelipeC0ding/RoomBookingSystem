import React, { useState } from 'react';
import { 
    Monitor, 
    Users, 
    ArrowLeft, 
    ArrowRight, 
    BarChart3 
} from 'lucide-react';
import ManageUsers from './ManageUsers';
import ManageRooms from './ManageRooms';
import ReportsPanel from './ReportsPanel'; 

const NavCard = ({ icon: Icon, title, description, badgeText, badgeColor, iconColor, onClick }) => (
    <button
        onClick={onClick}
        className="group text-left flex flex-col justify-between p-7 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all duration-300 w-full"
    >
        <div className="w-full">
            <div className="flex items-start justify-between mb-6 w-full">
                <div className={`p-3 rounded-xl bg-slate-50 ${iconColor} border border-slate-100 transition-transform duration-300 group-hover:scale-105 group-hover:bg-white group-hover:shadow-sm shrink-0`}>
                    <Icon size={24} strokeWidth={2} />
                </div>
                {badgeText && (
                    <span className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${badgeColor} shrink-0`}>
                        {badgeText}
                    </span>
                )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                {title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[90%]">
                {description}
            </p>
        </div>

        <div className="mt-8 flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
            Visit
            <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
    </button>
);

function AdminPage({ onGoBack }) {
    const [view, setView] = useState('menu');

    // Routing Logic
    if (view === 'rooms') return <ManageRooms onGoBack={() => setView('menu')} />;
    if (view === 'users') return <ManageUsers onGoBack={() => setView('menu')} />;
    if (view === 'reports') return <ReportsPanel onGoBack={() => setView('menu')} />;

    return (
        /* MODIFIED: Added w-full max-w-[100vw] overflow-x-hidden */
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-10 font-sans w-full max-w-[100vw] overflow-x-hidden">            
            <div className="max-w-5xl mx-auto w-full">
                
                {/* Top Navigation */}
                <button
                    onClick={onGoBack}
                    className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 md:mb-12"
                >
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm shrink-0">
                        <ArrowLeft size={16} />
                    </div>
                    Return to Dashboard
                </button>

                {/* Dashboard Header */}
                <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 w-full">
                    <div className="w-full">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 truncate">
                            Admin Page
                        </h1>
                        <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed">
                            Manage Rooms, Users, and Analytics
                        </p>
                    </div>
                </header>

                <hr className="border-slate-200 mb-8 md:mb-10 w-full" />

                {/* Module Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
                    <NavCard 
                        icon={Users}
                        title="Manage Users"
                        description="Manage permissions, accounts and invites"
                        iconColor="text-blue-600"
                        badgeColor="bg-blue-50 text-blue-700"
                        onClick={() => setView('users')}
                    />

                    <NavCard 
                        icon={Monitor}
                        title="Manage Rooms"
                        description="Add, remove, and edit rooms"
                        iconColor="text-emerald-600"
                        badgeColor="bg-emerald-50 text-emerald-700"
                        onClick={() => setView('rooms')}
                    />

                    <NavCard 
                        icon={BarChart3}
                        title="Reports & Analytics"
                        description="View booking trends and export data"
                        iconColor="text-purple-600"
                        badgeColor="bg-purple-50 text-purple-700"
                        onClick={() => setView('reports')}
                    />
                </div>

            </div>
        </div>
    );
}

export default AdminPage;
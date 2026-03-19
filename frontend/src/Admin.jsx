import React, { useState } from 'react';
import { Monitor, Users, Settings, ArrowLeft, ChevronRight, Activity } from 'lucide-react';
import ManageUsers from './ManageUsers';
import ManageRooms from './ManageRooms';

const NavCard = ({ icon: Icon, title, description, color, onClick }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 overflow-hidden"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`} />
        
        <div className={`p-3 rounded-xl mb-4 transition-colors ${color} bg-opacity-10 text-slate-700 group-hover:bg-opacity-100 group-hover:text-white`}>
            <Icon size={28} />
        </div>
        
        <div className="text-left">
            <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>

        <div className="mt-6 flex items-center text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Manage Now <ChevronRight size={16} className="ml-1" />
        </div>
    </button>
);

function AdminPage({ onGoBack }) {
    const [view, setView] = useState('menu');

    if (view === 'rooms') return <ManageRooms onGoBack={() => setView('menu')} />;
    if (view === 'users') return <ManageUsers onGoBack={() => setView('menu')} />;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">
                
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={onGoBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all font-semibold"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                    
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                        <Activity size={14} />
                        System Online
                    </div>
                </div>

                <header className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                        Admin <span className="text-blue-600">Control Center</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <NavCard 
                        icon={Users}
                        title=" Manage Users"
                        description="Modify permissions, reset passwords, and audit user activity logs."
                        color="bg-blue-600"
                        onClick={() => setView('users')}
                    />

                    <NavCard 
                        icon={Monitor}
                        title="Manage Rooms"
                        description="Add new spaces, configure hardware specs, and set room capacities."
                        color="bg-emerald-500"
                        onClick={() => setView('rooms')}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
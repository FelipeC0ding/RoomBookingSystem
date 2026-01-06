import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Filter,
  LayoutGrid
} from 'lucide-react';

function ManageRooms({ onGoBack }) {
    const [searchTerm, setSearchTerm] = useState("");

    const rooms = [
        { id: 1, name: "Boardroom A", capacity: 12, features: ["TV", "Wifi", "AC"] },
        { id: 2, name: "Huddle Room 1", capacity: 4, features: ["Wifi"] },
        { id: 3, name: "Conference Hall", capacity: 50, features: ["TV", "Wifi", "AC", "Projector"] },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={onGoBack}
                        className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
                    >
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-50">
                            <ArrowLeft size={18} />
                        </div>
                        Back to Admin
                    </button>
                    
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        <LayoutGrid size={16} />
                        <span>Room Controller v1.0</span>
                    </div>
                </div>

                {/* Main Action Bar - Integrated & Highly Visible */}
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search rooms..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200">
                            <Plus size={22} strokeWidth={3} />
                            Add New Room
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-8 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter">Room Identity</th>
                                    <th className="px-8 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter">Capacity</th>
                                    <th className="px-8 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter">Features</th>
                                    <th className="px-8 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter text-right">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="block font-black text-slate-900 text-lg uppercase tracking-tight">{room.name}</span>
                                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">UUID: {room.id}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <Users size={18} />
                                                </div>
                                                <span className="font-bold text-lg">{room.capacity}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {room.features.map(f => (
                                                    <span key={f} className="border border-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {/* Actions are now always visible */}
                                            <div className="flex justify-end gap-3">
                                                <button className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                                <button className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageRooms;
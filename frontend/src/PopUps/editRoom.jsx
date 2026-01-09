import React, { useState, useEffect } from 'react';
import { X, Save, Users, Info } from 'lucide-react';

function EditRooms({ room, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        capacity: 0,
        features: ""
    });

    useEffect(() => {
        if (room) {
            setFormData({
                id: room.RoomID,
                name: room.RoomName || "",
                location: room.Location || "",
                capacity: room.Capacity || 0,
                features: room.Features || ""
            });
        }
    }, [room]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col">

                    <div className="bg-slate-900 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tight">Edit Room Details</h2>
                            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Room Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="e.g. Boardroom Alpha"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="e.g. 1st Floor, East Wing"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Users size={14} /> Seating Capacity
                            </label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Room Features</label>
                            <textarea
                                value={formData.features}
                                onChange={(e) => setFormData({...formData, features: e.target.value})}
                                rows="3"
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                                placeholder="e.g. WiFi, Projector, AC..."
                            />
                        </div>

                        <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                            <Info className="text-amber-500 shrink-0" size={20} />
                            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                Changes will be saved to the database and updated across all staff dashboards immediately.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 p-6 bg-slate-50">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-xl bg-white border border-slate-200 p-4 font-black text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onSave(room.RoomID, formData)}
                                className="flex-1 rounded-xl bg-blue-600 p-4 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditRooms;
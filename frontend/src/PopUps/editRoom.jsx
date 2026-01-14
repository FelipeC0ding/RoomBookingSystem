import React, { useState, useEffect } from 'react';
import { X, Save, Users, Info, Trash2 } from 'lucide-react';
import fetchData from '../DAL/FetchData';
function EditRooms({ room, isOpen, onClose, onSave, onDelete }) {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        capacity: 0,
        features: ""
    });
    
    // Safety state for deletion confirmation
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
        setIsConfirmingDelete(false);
    }, [room, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col">

                    {/* Header - Cleaned up without the delete button */}
                    <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black uppercase tracking-tight">Edit Room</h2>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {room?.RoomID}</span>
                            </div>
                            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
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
                                Changes will be saved to the database and updated immediately.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions - Now including Delete */}
                    <div className="border-t border-slate-100 p-6 bg-slate-50 space-y-3">
                        {!isConfirmingDelete ? (
                            <div className="flex gap-3">
                                {/* Delete Button */}
                                <button
                                    onClick={() => setIsConfirmingDelete(true)}
                                    className="flex items-center justify-center rounded-xl border-2 border-red-100 bg-white p-4 font-black text-red-600 hover:bg-red-50 hover:border-red-200 transition-all group"
                                >
                                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                                
                                {/* Cancel Button */}
                                <button
                                    onClick={onClose}
                                    className="flex-[2] rounded-xl bg-white border border-slate-200 p-4 font-black text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>

                                {/* Save Button */}
                                <button
                                    onClick={() => onSave(room.RoomID, formData)}
                                    className="flex-[3] rounded-xl bg-blue-600 p-4 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} /> Save Changes
                                </button>
                            </div>
                        ) : (
                            /* Deletion Confirmation State */
                            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <button
                                    onClick={()=>onDelete(room.RoomID)}
                                    className="flex-1 rounded-xl bg-red-600 p-4 font-black text-white shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={20} /> Confirm Delete
                                </button>
                                <button
                                    onClick={() => setIsConfirmingDelete(false)}
                                    className="flex-1 rounded-xl bg-white border border-slate-200 p-4 font-black text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditRooms;
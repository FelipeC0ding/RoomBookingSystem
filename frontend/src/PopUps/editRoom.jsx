import React, { useState, useEffect } from 'react';
import { X, Save, Users, Info, Trash2, MapPin, DoorOpen, List } from 'lucide-react';
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
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header - Cleaned up to match the Admin theme */}
                <div className="px-6 py-5 border-b border-slate-200 bg-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Room</h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <DoorOpen size={16} className="text-slate-400" /> Room Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none"
                            placeholder="e.g. Boardroom Alpha"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <MapPin size={16} className="text-slate-400" /> Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none"
                            placeholder="e.g. 1st Floor, East Wing"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Users size={16} className="text-slate-400" /> Room Capacity
                        </label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <List size={16} className="text-slate-400" /> Room Features
                        </label>
                        <textarea
                            value={formData.features}
                            onChange={(e) => setFormData({...formData, features: e.target.value})}
                            rows="3"
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none resize-none"
                            placeholder="e.g. WiFi, Projector, Air Conditioning..."
                        />
                    </div>

                    <div className="flex gap-3 rounded-xl bg-blue-50 p-4 border border-blue-100">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-blue-800 leading-relaxed font-medium">
                            Changes will be saved and updated across the organization immediately.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-slate-200 p-6 bg-white space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    {!isConfirmingDelete ? (
                        <div className="flex gap-3">
                            {/* Delete Button */}
                            <button
                                onClick={() => setIsConfirmingDelete(true)}
                                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3.5 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all group"
                                title="Delete Room"
                            >
                                <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                            
                            {/* Cancel Button */}
                            <button
                                onClick={onClose}
                                className="flex-[2] rounded-xl bg-white border border-slate-200 p-3.5 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>

                            {/* Save Button - Updated to match Dark Navy theme */}
                            <button
                                onClick={() => onSave(room.RoomID, formData)}
                                className="flex-[3] rounded-xl bg-slate-900 p-3.5 font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    ) : (
                        /* Deletion Confirmation State */
                        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <button
                                onClick={() => onDelete(room.RoomID)}
                                className="flex-[3] rounded-xl bg-red-600 p-3.5 font-semibold text-white shadow-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> Confirm Delete
                            </button>
                            <button
                                onClick={() => setIsConfirmingDelete(false)}
                                className="flex-[2] rounded-xl bg-white border border-slate-200 p-3.5 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}

export default EditRooms;
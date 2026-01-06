import React, { useState } from 'react';
import { X, Save, Trash2, Users, Tv, Wifi, Wind, Info } from 'lucide-react';

function EditRooms({ room, isOpen, onClose, onSave }) {
    // Local state to manage form inputs
    const [formData, setFormData] = useState({
        name: room?.name || "",
        capacity: room?.capacity || 0,
        features: room?.features || []
    });

    if (!isOpen) return null;

    const toggleFeature = (feature) => {
        const newFeatures = formData.features.includes(feature)
            ? formData.features.filter(f => f !== feature)
            : [...formData.features, feature];
        setFormData({ ...formData, features: newFeatures });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            {/* Clickable Backdrop to close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col">
                    
                    {/* Header */}
                    <div className="bg-slate-900 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tight">Edit Room Details</h2>
                            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="mt-1 text-slate-400 text-sm font-medium">Room ID: #{room?.id}</p>
                    </div>

                    {/* Form Body */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        
                        {/* Room Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Room Designation</label>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="e.g. Boardroom Alpha"
                            />
                        </div>

                        {/* Capacity */}
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

                        {/* Features Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Available Amenities</label>
                            <div className="grid grid-cols-2 gap-3">
                                {["TV", "Wifi", "AC", "Projector", "Whiteboard", "Catering"].map((feature) => (
                                    <button
                                        key={feature}
                                        onClick={() => toggleFeature(feature)}
                                        className={`flex items-center gap-2 rounded-xl border-2 p-3 font-bold text-sm transition-all ${
                                            formData.features.includes(feature)
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className={`h-2 w-2 rounded-full ${formData.features.includes(feature) ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                        {feature}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Tip */}
                        <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                            <Info className="text-amber-500 shrink-0" size={20} />
                            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                Updates made here will reflect immediately in the booking portal for all staff members.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-100 p-6 bg-slate-50">
                        <div className="flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 rounded-xl bg-white border border-slate-200 p-4 font-black text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => onSave(formData)}
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
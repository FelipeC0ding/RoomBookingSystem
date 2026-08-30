import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Info, MapPin, Sparkles, Tag } from 'lucide-react';
import fetchData from '../DAL/FetchData'; // Replaced Supabase import

function AddRoom({ isOpen, onClose, onAdd }) {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        capacity: 0,
        features: "",
        category_ids: [] 
    });

    // Use FetchDAL to securely get categories
    useEffect(() => {
        const loadCategories = async () => {
            const data = await fetchData.getCategories();
            if (data) setCategories(data);
        };
        if (isOpen) loadCategories();
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleCategory = (categoryId) => {
        setFormData(prev => {
            const currentIds = prev.category_ids || [];
            if (currentIds.includes(categoryId)) {
                return { ...prev, category_ids: currentIds.filter(id => id !== categoryId) };
            } else {
                return { ...prev, category_ids: [...currentIds, categoryId] };
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="relative w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col">

                    <div className="bg-slate-900 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Plus className="text-blue-400" size={24} strokeWidth={3} />
                                    Add New Room
                                </h2>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Create a new workspace entry
                                </span>
                            </div>
                            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Sparkles size={14} /> Room Title
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Innovation Hub"
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MapPin size={14} /> Location / Floor
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Level 4, West Wing"
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Tag size={14} /> Room Categories
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.length === 0 ? (
                                    <span className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100 w-full">
                                        No categories available. Please add some in the Admin panel first.
                                    </span>
                                ) : (
                                    categories.map(cat => {
                                        const isSelected = formData.category_ids.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleCategory(cat.id);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                                    isSelected 
                                                    ? 'bg-blue-100 border-blue-500 text-blue-700' 
                                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Users size={14} /> Max Capacity
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Key Features</label>
                            <textarea
                                rows="3"
                                placeholder="e.g. 4K Projector, Whiteboard, Video Conferencing..."
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                                onChange={(e) => setFormData({...formData, features: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 border border-blue-100">
                            <Info className="text-blue-500 shrink-0" size={20} />
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                New rooms will be available for booking immediately after creation.
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
                                onClick={() => onAdd(formData.name, formData.location, formData.capacity, formData.features, formData.category_ids)}
                                className="flex-[2] rounded-xl bg-blue-600 p-4 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} strokeWidth={3} /> Create Room
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AddRoom;
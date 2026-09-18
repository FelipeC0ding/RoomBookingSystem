import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Info, MapPin, Sparkles, Tag } from 'lucide-react';
import fetchData from '../DAL/FetchData';
import ErrorPopup from './ErrorPopUp';
import {
    validateRoomName,
    validateRoomLocation,
    validateRoomCapacity,
    validateRoomFeatures,
    validateUuid
} from '../lib/validation';

function AddRoom({ isOpen, onClose, onAdd }) {
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        capacity: "",
        features: "",
        category_ids: [] 
    });

    useEffect(() => {
        let isMounted = true;
        if (isOpen) {
            fetchData.getCategories().then(data => {
                if (isMounted && data) setCategories(data);
            });
        }
        return () => { isMounted = false; };
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            name: "",
            location: "",
            capacity: "",
            features: "",
            category_ids: [] 
        });
        setErrorMessage('');
        setIsErrorOpen(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

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
            <div className="absolute inset-0" onClick={handleClose} />
            
            <div className="relative w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col">

                    {/* MODIFIED HEADER: Removed navy background, replaced with white and border */}
                    <div className="px-6 py-5 border-b border-slate-200 bg-white">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                    Add New Room
                                </h2>
                            </div>
                            <button 
                                onClick={handleClose} 
                                className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
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
                                maxLength={100}
                                value={formData.name}
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
                                maxLength={100}
                                value={formData.location}
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
                                <Users size={14} /> Max Capacity (1-1000)
                            </label>
                            <input
                                type="number"
                                placeholder="30"
                                min="1"
                                max="1000"
                                step="1"
                                value={formData.capacity}
                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Key Features</label>
                            <textarea
                                rows="3"
                                placeholder="e.g. 4K Projector, Whiteboard, Video Conferencing..."
                                maxLength={500}
                                value={formData.features}
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
                                onClick={handleClose}
                                className="flex-1 rounded-xl bg-white border border-slate-200 p-4 font-black text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    const nameCheck = validateRoomName(formData.name);
                                    if (!nameCheck.isValid) {
                                        setErrorMessage(nameCheck.error);
                                        setIsErrorOpen(true);
                                        return;
                                    }

                                    const locationCheck = validateRoomLocation(formData.location);
                                    if (!locationCheck.isValid) {
                                        setErrorMessage(locationCheck.error);
                                        setIsErrorOpen(true);
                                        return;
                                    }

                                    const capacityCheck = validateRoomCapacity(formData.capacity);
                                    if (!capacityCheck.isValid) {
                                        setErrorMessage(capacityCheck.error);
                                        setIsErrorOpen(true);
                                        return;
                                    }

                                    const featuresCheck = validateRoomFeatures(formData.features);
                                    if (!featuresCheck.isValid) {
                                        setErrorMessage(featuresCheck.error);
                                        setIsErrorOpen(true);
                                        return;
                                    }

                                    const cleanCategoryIds = [];
                                    if (Array.isArray(formData.category_ids)) {
                                        for (const catId of formData.category_ids) {
                                            const cCheck = validateUuid(catId, 'Category ID');
                                            if (!cCheck.isValid) {
                                                setErrorMessage(cCheck.error);
                                                setIsErrorOpen(true);
                                                return;
                                            }
                                            cleanCategoryIds.push(cCheck.value);
                                        }
                                    }

                                    const res = await onAdd(nameCheck.value, locationCheck.value, capacityCheck.value, featuresCheck.value, cleanCategoryIds);
                                    if (res && !res.success) {
                                        setErrorMessage(res.error || 'Failed to create room.');
                                        setIsErrorOpen(true);
                                        return;
                                    }
                                    resetForm();
                                }}
                                className="flex-[2] rounded-xl bg-blue-600 p-4 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} strokeWidth={3} /> Create Room
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <ErrorPopup
                isOpen={isErrorOpen}
                message={errorMessage}
                onClose={() => setIsErrorOpen(false)}
            />
        </div>
    );
}

export default AddRoom;
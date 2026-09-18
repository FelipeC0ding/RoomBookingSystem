import React, { useState, useEffect } from 'react';
import { X, Save, Users, Info, Trash2, MapPin, DoorOpen, List, Tag } from 'lucide-react';
import fetchData from '../DAL/FetchData'; 
import ErrorPopup from './ErrorPopUp';
import {
    validateRoomName,
    validateRoomLocation,
    validateRoomCapacity,
    validateRoomFeatures,
    validateId,
    validateUuid
} from '../lib/validation';

function getRoomFormData(r) {
    return {
        id: r?.RoomID ?? r?.room_id ?? r?.id,
        name: r?.RoomName ?? r?.room_name ?? r?.name ?? "",
        location: r?.Location ?? r?.location ?? "",
        capacity: r?.Capacity ?? r?.capacity ?? 0,
        features: r?.Features ?? r?.features ?? "",
        category_ids: Array.isArray(r?.category_ids)
            ? [...r.category_ids]
            : Array.isArray(r?.categoryIds)
            ? [...r.categoryIds]
            : []
    };
}

function EditRooms({ room, isOpen, onClose, onSave, onDelete }) {
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [formData, setFormData] = useState(() => getRoomFormData(room));
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Sync formData whenever room or isOpen changes
    useEffect(() => {
        if (room && isOpen) {
            setFormData(getRoomFormData(room));
            setIsConfirmingDelete(false);
            setErrorMessage('');
            setIsErrorOpen(false);
        }
    }, [room, isOpen]);

    // Use FetchDAL to securely get categories
    useEffect(() => {
        let isMounted = true;
        if (isOpen) {
            fetchData.getCategories().then(data => {
                if (isMounted && data) setCategories(data);
            });
        }
        return () => { isMounted = false; };
    }, [isOpen]);

    const handleClose = () => {
        setIsConfirmingDelete(false);
        setErrorMessage('');
        setIsErrorOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    const toggleCategory = (categoryId) => {
        setFormData(prev => {
            const currentIds = prev.category_ids || [];
            const exists = currentIds.some(id => String(id) === String(categoryId));
            if (exists) {
                return { ...prev, category_ids: currentIds.filter(id => String(id) !== String(categoryId)) };
            } else {
                return { ...prev, category_ids: [...currentIds, categoryId] };
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={handleClose} />
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                
                <div className="px-6 py-5 border-b border-slate-200 bg-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Room</h2>
                        </div>
                        <button 
                            onClick={handleClose} 
                            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <DoorOpen size={16} className="text-slate-400" /> Room Name
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <MapPin size={16} className="text-slate-400" /> Location
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none"
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
                                    const isSelected = (formData.category_ids || []).some(id => String(id) === String(cat.id));
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

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Users size={16} className="text-slate-400" /> Room Capacity (1-1000)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            step="1"
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
                            maxLength={500}
                            onChange={(e) => setFormData({...formData, features: e.target.value})}
                            rows="3"
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-3 rounded-xl bg-blue-50 p-4 border border-blue-100">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-blue-800 leading-relaxed font-medium">
                            Changes will be saved and updated across the organization immediately.
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-200 p-6 bg-white space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    {!isConfirmingDelete ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsConfirmingDelete(true)}
                                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3.5 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all group"
                                title="Delete Room"
                            >
                                <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                            
                            <button
                                onClick={handleClose}
                                className="flex-[2] rounded-xl bg-white border border-slate-200 p-3.5 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    const roomId = room?.RoomID ?? room?.id ?? formData.id;
                                    const idCheck = validateId(roomId, 'Room ID');
                                    if (!idCheck.isValid) {
                                        setErrorMessage(idCheck.error);
                                        setIsErrorOpen(true);
                                        return;
                                    }

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

                                    const res = await onSave(idCheck.value, {
                                        name: nameCheck.value,
                                        location: locationCheck.value,
                                        capacity: capacityCheck.value,
                                        features: featuresCheck.value,
                                        category_ids: cleanCategoryIds
                                    });
                                    if (res && !res.success) {
                                        setErrorMessage(res.error || 'Failed to save room changes.');
                                        setIsErrorOpen(true);
                                    }
                                }}
                                className="flex-[3] rounded-xl bg-slate-900 p-3.5 font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <button
                                onClick={async () => {
                                    const roomId = room?.RoomID ?? room?.id ?? formData.id;
                                    const idCheck = validateId(roomId, 'Room ID');
                                    if (!idCheck.isValid) {
                                        setErrorMessage(idCheck.error);
                                        setIsErrorOpen(true);
                                        return;
                                    }
                                    const res = await onDelete(idCheck.value);
                                    if (res && !res.success) {
                                        setErrorMessage(res.error || 'Failed to delete room.');
                                        setIsErrorOpen(true);
                                    }
                                }}
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

            <ErrorPopup
                isOpen={isErrorOpen}
                message={errorMessage}
                onClose={() => setIsErrorOpen(false)}
            />
        </div>
    );
}

export default EditRooms;
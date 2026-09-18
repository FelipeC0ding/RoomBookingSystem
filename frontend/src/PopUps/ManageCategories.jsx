import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Trash2, Info, AlertCircle } from 'lucide-react';
import fetchData from '../DAL/FetchData';
import { validateCategoryName, validateUuid } from '../lib/validation';
import ErrorPopup from './ErrorPopUp';

function ManageCategories({ isOpen, onClose, onCategoriesUpdated }) {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isErrorOpen, setIsErrorOpen] = useState(false);

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
        setNewCategoryName("");
        setCategoryError("");
        setErrorMessage("");
        setIsErrorOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    const handleAdd = async () => {
        const check = validateCategoryName(newCategoryName, categories);
        if (!check.isValid) {
            setCategoryError(check.error);
            return;
        }
        setCategoryError("");
        setIsLoading(true);
        const result = await fetchData.addCategory(check.value);
        if (result.success) {
            setNewCategoryName('');
            const updatedCats = await fetchData.getCategories();
            setCategories(updatedCats || []);
            onCategoriesUpdated(updatedCats || []);
        } else {
            const err = result.error || "Failed to add category.";
            setCategoryError(err);
            setErrorMessage(err);
            setIsErrorOpen(true);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        const idCheck = validateUuid(id, 'Category ID');
        if (!idCheck.isValid) {
            setErrorMessage(idCheck.error);
            setIsErrorOpen(true);
            return;
        }
        const result = await fetchData.deleteCategory(idCheck.value);
        if (result.success) {
            const updatedCats = await fetchData.getCategories();
            setCategories(updatedCats || []);
            onCategoriesUpdated(updatedCats || []);
        } else {
            setErrorMessage(result.error || "Failed to delete category.");
            setIsErrorOpen(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={handleClose} />
            
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header - Matches Edit Room Style */}
                <div className="px-6 py-5 border-b border-slate-200 bg-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manage Categories</h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body - Matches Edit Room Style */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    
                    {/* Add Category Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            New Category
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. IT Room"
                                maxLength={50}
                                value={newCategoryName}
                                className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none"
                                onChange={(e) => {
                                    setNewCategoryName(e.target.value);
                                    if (categoryError) setCategoryError("");
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <button
                                onClick={handleAdd}
                                disabled={isLoading || !newCategoryName.trim()}
                                className="rounded-xl bg-slate-900 px-5 font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        {categoryError && (
                            <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
                                <AlertCircle size={14} /> {categoryError}
                            </p>
                        )}
                    </div>

                    {/* Existing Categories List */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            Active Categories
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {categories.length === 0 ? (
                                <span className="text-sm text-slate-400 italic bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-full">
                                    No categories created yet.
                                </span>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                                        <button 
                                            onClick={() => handleDelete(cat.id)} 
                                            className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 hover:border-red-200 p-1.5 rounded-lg border border-slate-200 transition-all"
                                            title="Delete Category"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="flex gap-3 rounded-xl bg-blue-50 p-4 border border-blue-100">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-blue-800 leading-relaxed font-medium">
                            Categories deleted here will be automatically removed from any rooms they were assigned to.
                        </p>
                    </div>
                </div>

                {/* Footer - Matches Edit Room Style */}
                <div className="border-t border-slate-100 p-6 bg-slate-50">
                    <button
                        onClick={handleClose}
                        className="w-full rounded-xl bg-blue-600 p-4 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        Done
                    </button>
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

export default ManageCategories;
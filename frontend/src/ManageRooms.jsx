import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Plus, 
    Search, 
    Edit2, 
    Users, 
    Tag,
    Loader2
} from 'lucide-react';
import fetchData from './DAL/FetchData';
import EditRoom from './PopUps/editRoom';
import AddRoom from './PopUps/AddRoom';
import ManageCategories from './PopUps/ManageCategories';

function ManageRooms({ onGoBack }) {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [popUpOpen, setPopUpState] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    
    // Popup states
    const [addNewRoomState, setAddRoom] = useState(false);
    const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

    // State for categories
    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                // Fetch both rooms and categories concurrently for faster, synchronized loading
                const [roomsData, categoriesData] = await Promise.all([
                    fetchData.getRooms(),
                    fetchData.getCategories()
                ]);
                
                setRooms(roomsData || []);
                setCategories(categoriesData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredRooms = rooms.filter((room) => {
        const term = searchTerm.toLowerCase();
        return (
            room.RoomName?.toLowerCase().includes(term) ||
            room.Features?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
            <div className="max-w-6xl mx-auto w-full">
                
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
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between w-full">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search rooms..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <button 
                            onClick={() => setManageCategoriesOpen(true)}
                            disabled={isLoading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
                        >
                            <Tag size={20} />
                            Manage Categories
                        </button>
                        
                        <button 
                            onClick={() => setAddRoom(true)}
                            disabled={isLoading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg shadow-blue-200"
                        >
                            <Plus size={22} strokeWidth={3} />
                            Add New Room
                        </button>
                    </div>
                </div>

                {/* Rooms Table */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-full min-h-[400px]">
                    <div className="w-full max-w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter">Room Name</th>
                                    <th className="px-6 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter">Categories</th>
                                    <th className="px-6 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter">Capacity</th>
                                    <th className="px-6 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter">Features</th>
                                    <th className="px-6 py-5 text-slate-400 text-xs uppercase font-black tracking-tighter text-right">Edit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    // Professional Skeleton Loading State
                                    [...Array(5)].map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="px-6 py-6"><div className="h-5 bg-slate-200 rounded-md w-3/4"></div></td>
                                            <td className="px-6 py-6">
                                                <div className="flex gap-2">
                                                    <div className="h-6 bg-slate-200 rounded-md w-16"></div>
                                                    <div className="h-6 bg-slate-200 rounded-md w-20"></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6"><div className="h-5 bg-slate-200 rounded-md w-12"></div></td>
                                            <td className="px-6 py-6"><div className="h-5 bg-slate-200 rounded-full w-24"></div></td>
                                            <td className="px-6 py-6 flex justify-end"><div className="h-8 bg-slate-200 rounded-lg w-20"></div></td>
                                        </tr>
                                    ))
                                ) : filteredRooms.length > 0 ? (
                                    // Actual Data Render
                                    filteredRooms.map((room) => {
                                        const roomCategories = categories.filter(c => room.category_ids?.includes(c.id));
                                        
                                        return (
                                            <tr key={room.RoomID || room.id} className="hover:bg-slate-50/50 transition-colors animate-in fade-in duration-300">
                                                <td className="px-6 py-6">
                                                    <span className="block font-black text-slate-900 text-base md:text-lg uppercase tracking-tight">{room.RoomName}</span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    {roomCategories.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {roomCategories.map(cat => (
                                                                <span key={cat.id} className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md text-xs font-bold">
                                                                    {cat.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm italic">Uncategorized</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <div className="p-2 bg-slate-100 rounded-lg">
                                                            <Users size={16} />
                                                        </div>
                                                        <span className="font-bold text-base">{room.Capacity}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {room.Features && (
                                                            <span className="border border-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white">
                                                                {room.Features}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex justify-end gap-3">
                                                        <button 
                                                            className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                            onClick={() => {
                                                                setPopUpState(true);
                                                                setSelectedRoom(room);
                                                            }}
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    // Empty State (No rooms found)
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-500 font-medium animate-in fade-in duration-300">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="p-4 bg-slate-100 rounded-full">
                                                    <Search size={24} className="text-slate-400" />
                                                </div>
                                                <p>No rooms found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ManageCategories 
                isOpen={manageCategoriesOpen}
                onClose={() => setManageCategoriesOpen(false)}
                onCategoriesUpdated={(updatedCats) => setCategories(updatedCats)}
            />

            <EditRoom 
                room={selectedRoom} 
                isOpen={popUpOpen} 
                onClose={() => setPopUpState(false)} 
                onSave={async(id, updatedData) => {
                    await fetchData.UpdateRooms(
                        id,
                        updatedData.name, 
                        updatedData.location, 
                        updatedData.capacity, 
                        updatedData.features,
                        updatedData.category_ids
                    );
                    setPopUpState(false);
                    // Silent background refresh
                    const updatedRooms = await fetchData.getRooms();
                    setRooms(updatedRooms);
                }}
                onDelete={async(roomID) => {
                    await fetchData.deleteRoom(roomID);
                    setPopUpState(false);
                    // Silent background refresh
                    const updatedRooms = await fetchData.getRooms();
                    setRooms(updatedRooms);
                }}
            />

            <AddRoom 
                isOpen={addNewRoomState} 
                onClose={() => setAddRoom(false)} 
                onAdd={async(title, location, capacity, features, categoryIds) => {
                    await fetchData.AddNewRoom(title, location, capacity, features, categoryIds);
                    setAddRoom(false);
                    // Silent background refresh
                    const updatedRooms = await fetchData.getRooms();
                    setRooms(updatedRooms);
                }}
            />
        </div>
    );
}

export default ManageRooms;
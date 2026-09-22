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
import { validateSearchTerm } from './lib/validation.js';
import EditRoom from './PopUps/editRoom';
import AddRoom from './PopUps/AddRoom';
import ManageCategories from './PopUps/ManageCategories';
import {supabase} from './supabaseClient'

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

    
    // Function to refresh rooms from database (bypassing cache)
    const refreshRooms = async () => {
        try {
            const roomsData = await fetchData.getRooms(true);
            if (roomsData) {
                setRooms(roomsData);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    // Function to refresh categories from database
    const refreshCategories = async () => {
        try {
            const categoriesData = await fetchData.getCategories();
            if (categoriesData) {
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        let roomChannel = null;

        async function initRealtimeAndData() {
            setIsLoading(true);
            try {
                // 1. Fetch initial data concurrently
                const [roomsData, categoriesData] = await Promise.all([
                    fetchData.getRooms(),
                    fetchData.getCategories()
                ]);
                
                if (isMounted) {
                    setRooms(roomsData || []);
                    setCategories(categoriesData || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }

            // 2. Ensure session token is attached to the Realtime connection for RLS authorization
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    await supabase.realtime.setAuth(session.access_token);
                }
            } catch (authErr) {
                console.warn("Realtime setAuth warning:", authErr);
            }

            if (!isMounted) return;

            // 3. Create a unique channel to avoid reusing closing/stale channels across re-mounts
            const channelId = 'system-rooms-channel';
            roomChannel = supabase.channel(channelId);
            const handleRoomChange = (payload) => {
                console.log('Realtime change received for Room:', payload);
                
                if (!isMounted) return;

                if (payload.eventType === 'INSERT') {
                    setRooms(prevRooms => [...prevRooms, payload.new]);
                } 
                else if (payload.eventType === 'UPDATE') {
                    setRooms(prevRooms => prevRooms.map(room => {
                        const roomId = room.RoomID ?? room.id;
                        const payloadId = payload.new.RoomID ?? payload.new.id;
                        return roomId === payloadId ? { ...room, ...payload.new } : room;
                    }));
                } 
                else if (payload.eventType === 'DELETE') {
                    setRooms(prevRooms => prevRooms.filter(room => {
                        const roomId = room.RoomID ?? room.id;
                        const payloadId = payload.old.RoomID ?? payload.old.id;
                        return roomId !== payloadId;
                    }));
                }
            };

            const handleCategoryChange = (payload) => {
                console.log('Realtime change received for Category:', payload);
                if (isMounted) {
                    refreshRooms();
                    refreshCategories();
                }
            };

            roomChannel
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'Room' },
                    handleRoomChange
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'Room' },
                    handleRoomChange
                )
                // CHANGED: Listens to the correct 'categories' table
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'categories' },
                    handleCategoryChange
                )
                .subscribe((status, err) => {
                    if (err) {
                        console.error('Realtime Room subscription error:', err);
                    }
                    console.log('Realtime Room subscription status:', status);
                });
        }

        initRealtimeAndData();

        // Cleanup on unmount
        return () => {
            isMounted = false;
            if (roomChannel) {
                supabase.removeChannel(roomChannel);
            }
        };
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
                            value={searchTerm}
                            maxLength={100}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                            onChange={(e) => {
                                const val = validateSearchTerm(e.target.value, 100);
                                if (val.isValid) {
                                    setSearchTerm(val.value);
                                }
                            }}
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
                                                                setSelectedRoom(room);
                                                                setPopUpState(true);
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
                onCategoriesUpdated={(updatedCats) => {
                    setCategories(updatedCats);
                    refreshRooms();
                }}
            />

            {popUpOpen && selectedRoom && (
                <EditRoom 
                    key={selectedRoom.RoomID || selectedRoom.id}
                    room={selectedRoom} 
                    isOpen={popUpOpen} 
                    onClose={() => {
                        setPopUpState(false);
                        setSelectedRoom(null);
                    }} 
                    onSave={async(id, updatedData) => {
                        const res = await fetchData.UpdateRooms(
                            id,
                            updatedData.name, 
                            updatedData.location, 
                            updatedData.capacity, 
                            updatedData.features,
                            updatedData.category_ids
                        );
                        if (!res || !res.success) {
                            return res || { success: false, error: 'Failed to update room.' };
                        }
                        
                        // Close popup
                        setPopUpState(false);
                        setSelectedRoom(null);

                        // 1. Optimistically update local state immediately so changes reflect on the page instantly
                        setRooms(prev => prev.map(r => {
                            const rId = r.RoomID ?? r.room_id ?? r.id;
                            if (String(rId) === String(id)) {
                                return {
                                    ...r,
                                    RoomName: updatedData.name,
                                    Location: updatedData.location,
                                    Capacity: parseInt(updatedData.capacity, 10),
                                    Features: updatedData.features,
                                    category_ids: updatedData.category_ids
                                };
                            }
                            return r;
                        }));

                        // 2. Fetch fresh rooms from database to ensure full consistency
                        await refreshRooms();
                        return { success: true };
                    }}
                    onDelete={async(roomID) => {
                        const res = await fetchData.deleteRoom(roomID);
                        if (!res || !res.success) {
                            return res || { success: false, error: 'Failed to delete room.' };
                        }
                        
                        // Close popup
                        setPopUpState(false);
                        setSelectedRoom(null);

                        // Optimistically remove from state immediately
                        setRooms(prev => prev.filter(r => String(r.RoomID ?? r.room_id ?? r.id) !== String(roomID)));

                        // Fetch fresh rooms from database
                        await refreshRooms();
                        return { success: true };
                    }}
                />
            )}

            <AddRoom 
                isOpen={addNewRoomState} 
                onClose={() => setAddRoom(false)} 
                onAdd={async(title, location, capacity, features, categoryIds) => {
                    const res = await fetchData.AddNewRoom(title, location, capacity, features, categoryIds);
                    if (!res || !res.success) {
                        return res || { success: false, error: 'Failed to add room.' };
                    }
                    
                    setAddRoom(false);
                    await refreshRooms();
                    return { success: true };
                }}
            />
        </div>
    );
}

export default ManageRooms;
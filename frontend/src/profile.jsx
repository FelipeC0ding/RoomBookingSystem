import React, { useState, useEffect, useMemo } from 'react';
import { 
    ChevronDown, ChevronUp, Settings, ArrowLeft, 
    Calendar, Clock, BookOpen, User as UserIcon, Inbox, Repeat 
} from 'lucide-react';
import fetchData from './DAL/FetchData';
import PopUp from './PopUps/editBooking';

// --- Sub-component for rendering individual or grouped bookings ---
// --- Sub-component for rendering individual or grouped bookings ---
const BookingGroupCard = ({ group, isPast, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isRecurring = group.groupedBookings.length > 1;

    const handleMainClick = () => {
        if (isRecurring) {
            setIsExpanded(!isExpanded);
        } else {
            const b = group.groupedBookings[0];
            onEdit(b.BookingID, b.Title, b.Description, b.BookingStartTime, b.BookingEndTime, b.BookingDate);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group overflow-hidden">
            {/* Main Header Area */}
            <div 
                className={`flex items-center justify-between ${isRecurring ? 'cursor-pointer' : 'cursor-pointer'}`}
                onClick={handleMainClick}
            >
                <div className="flex items-start sm:items-center gap-5 w-full">
                    <div className="hidden sm:flex w-12 h-12 bg-slate-50 rounded-xl items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                        {isRecurring ? <Repeat size={20} /> : <Calendar size={20} />}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-800 text-lg">{group.RoomName}</h3>
                            {isRecurring && (
                                // CHANGED HERE: bg-blue-50 and text-blue-600
                                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Repeat size={10} /> Series ({group.groupedBookings.length})
                                </span>
                            )}
                        </div>
                        
                        <div className="mt-2 space-y-2">
                            <h4 className="text-base font-semibold text-slate-800 leading-tight">
                                {group.Title}
                            </h4>
                            <p className="text-sm text-slate-500 line-clamp-2 italic">
                                "{group.Description}"
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-100">
                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                    <Clock size={13} className="text-blue-500" />
                                    {group.BookingStartTime} – {group.BookingEndTime}
                                </span>
                                
                                {!isRecurring && (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                        <Calendar size={13} className="text-blue-500" />
                                        {new Date(group.BookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Badge & Chevron */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isPast ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            {isPast ? 'Confirmed' : 'Upcoming'}
                        </span>
                        {isRecurring && (
                            <div className="text-slate-400 p-1 bg-slate-50 rounded-full hover:bg-slate-100 hover:text-blue-600 transition-colors">
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Recurring Dates Area */}
            {isRecurring && isExpanded && (
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {group.groupedBookings.map((b) => (
                        <div 
                            key={b.BookingID}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                onEdit(b.BookingID, b.Title, b.Description, b.BookingStartTime, b.BookingEndTime, b.BookingDate);
                            }}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors group/item"
                        >
                            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400 group-hover/item:text-blue-600" />
                                {new Date(b.BookingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            {!isPast && (
                                <Settings size={14} className="text-slate-400 group-hover/item:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
function ProfilePage({ onGoBack }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [department, setDepartment] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const userData = await fetchData.getUserData();
            let dept = await fetchData.getCurrentUser();
            dept = dept.DepartmentID;
            dept = await fetchData.GetDepartmentName(parseInt(dept));
            setUser(userData);
            setDepartment(dept);
        }
        getUser();
    }, []);

    const loadData = async () => {
        let user = await fetchData.getUserData();
        const data = await fetchData.fetchUserBookings(user.id);
        setBookings(data || []);
    };

    useEffect(() => {
        const getBookings = async () => {
            try {
                await loadData();
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        }
        getBookings();
    }, []);

    const [popupConfig, setPopupConfig] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        BookingID: 0,
        timeDuration: '',
        bookingDate: '',
        description: ''
    });

    function handleBookingClick(id, title, description, startTime, endTime, bookingDate) {
        setPopupConfig({
            isOpen: true,
            type: 'success',
            title: title,
            message: `Edit Booking`,
            BookingID: id,
            timeDuration: `${startTime} - ${endTime}`,
            description: description,
            bookingDate: bookingDate
        });
    }

    // --- Grouping Logic ---
    // We use useMemo so this only recalculates when 'bookings' state changes
    const { upcomingGroups, pastGroups, pendingCount } = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const upcoming = [];
        const past = [];
        let count = 0;

        // 1. Separate into past and future
        bookings.forEach(b => {
            if (new Date(b.BookingDate).setHours(0, 0, 0, 0) >= today) {
                upcoming.push(b);
                count++;
            } else {
                past.push(b);
            }
        });

        // 2. Helper function to group bookings
        const groupBookings = (bookingList) => {
            const map = new Map();
            bookingList.forEach(b => {
                // Group by Title, Room, and Time to identify a "series"
                const key = `${b.Title}_${b.RoomName}_${b.BookingStartTime}_${b.BookingEndTime}`;
                if (!map.has(key)) {
                    map.set(key, { ...b, groupedBookings: [b] });
                } else {
                    map.get(key).groupedBookings.push(b);
                    // Sort dates chronologically within the group
                    map.get(key).groupedBookings.sort((x, y) => new Date(x.BookingDate) - new Date(y.BookingDate));
                }
            });
            return Array.from(map.values());
        };

        return {
            upcomingGroups: groupBookings(upcoming),
            pastGroups: groupBookings(past),
            pendingCount: count
        };
    }, [bookings]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* Navigation Header */}
                <button
                    onClick={onGoBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Return Home</span>
                </button>

               <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />

                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        {loading ? (
                            <>
                                <div className="w-28 h-28 bg-slate-200 rounded-[2rem] animate-pulse" />
                                <div className="text-center md:text-left flex-1 space-y-4">
                                    <div className="space-y-2 flex flex-col items-center md:items-start">
                                        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                                        <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative group">
                                    <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 transform group-hover:scale-105 transition-transform duration-300">
                                        <UserIcon size={44} strokeWidth={1.5} />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" />
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">User Profile</span>
                                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                                            {user?.user_metadata?.Firstname || 'User'}
                                        </h1>
                                        
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-sm font-semibold border border-slate-200">
                                                Department: {department || 'General Staff'}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                Click a booking to make an edit
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block w-px h-16 bg-slate-100 mx-4" />
                                <div className="bg-slate-900 rounded-[2rem] p-8 text-center min-w-[180px] shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1 transition-transform">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.15em] font-black mb-2">Schedule</p>
                                    <div className="flex flex-col">
                                        <span className="text-white text-5xl font-black leading-none">{pendingCount}</span>
                                        <span className="text-blue-400 text-[11px] font-bold mt-2 uppercase">Upcoming</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* UPCOMING BOOKINGS */}
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <BookOpen size={22} className="text-blue-600" />
                        My Current Bookings
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>Fetching your bookings...</p>
                        </div>
                    ) : upcomingGroups.length > 0 ? (
                        upcomingGroups.map((group, index) => (
                            <BookingGroupCard 
                                key={index} 
                                group={group} 
                                isPast={false} 
                                onEdit={handleBookingClick} 
                            />
                        ))
                    ) : (
                        <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-slate-400">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="font-medium italic">No upcoming bookings scheduled.</p>
                        </div>
                    )}

                    {/* PAST BOOKINGS */}
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mt-12 mb-6">
                        <BookOpen size={22} className="text-blue-600" />
                        My Booking History
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>Loading your history...</p>
                        </div>
                    ) : pastGroups.length > 0 ? (
                        pastGroups.map((group, index) => (
                            <BookingGroupCard 
                                key={index} 
                                group={group} 
                                isPast={true} 
                                onEdit={handleBookingClick} 
                            />
                        ))
                    ) : (
                        <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-slate-400">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="font-medium italic">No bookings found in your history.</p>
                        </div>
                    )}
                </div>
            </div>

            <PopUp
                isOpen={popupConfig.isOpen}
                type={popupConfig.type}
                title={popupConfig.title}
                message={popupConfig.message}
                BookingID={popupConfig.BookingID}
                timeDuration={popupConfig.timeDuration}
                bookingDate={popupConfig.bookingDate}
                description={popupConfig.description}
                onClose={async () => {
                    setPopupConfig({ ...popupConfig, isOpen: false });
                    await loadData();
                }}
            />
        </div>
    );
}

export default ProfilePage;
import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronDown, ChevronLeft, ChevronRight, Settings, ArrowLeft,
    Calendar, Clock, BookOpen, User as UserIcon, Inbox, Repeat, X
} from 'lucide-react';
import fetchData from './DAL/FetchData';
import PopUp from './PopUps/editBooking';

const toKey = (dateLike) => {
    const d = new Date(dateLike);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isSameDay = (a, b) => toKey(a) === toKey(b);
const MONTH_LABEL = (d) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const BookingChip = ({ booking, isPast, onClick }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(booking); }}
        className={`w-full text-left px-2 py-1 rounded-md text-[11px] font-semibold truncate transition-colors ${
            isPast
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
        }`}
        title={`${booking.Title} · ${booking.RoomName} · ${booking.BookingStartTime}-${booking.BookingEndTime}`}
    >
        {booking.BookingStartTime} {booking.Title}
    </button>
);

const DayDetailPanel = ({ date, bookings, todayKey, onEdit, onClose }) => {
    if (!date) return null;
    const isPast = toKey(date) < todayKey;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 mt-6 animate-in fade-in slide-in-from-top-2 duration-200 box-border w-full">
            <div className="flex items-center justify-between mb-4 w-full">
                <div className="overflow-hidden">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 truncate">
                        {isPast ? 'Past booking' : 'Upcoming'}
                    </p>
                    <h3 className="text-lg md:text-xl font-black text-slate-800 truncate">
                        {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-2 transition-colors shrink-0"
                >
                    <X size={18} />
                </button>
            </div>

            {bookings.length === 0 ? (
                <p className="text-slate-400 italic text-sm py-6 text-center">No bookings on this day.</p>
            ) : (
                <div className="space-y-3 w-full box-border">
                    {bookings
                        .slice()
                        .sort((a, b) => a.BookingStartTime.localeCompare(b.BookingStartTime))
                        .map((b) => (
                            <div
                                key={b.BookingID}
                                onClick={() => onEdit(b)}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors group gap-3 w-full box-border"
                            >
                                <div className="flex items-center gap-3 md:gap-4 overflow-hidden w-full">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-slate-800 text-sm truncate w-full">{b.Title}</p>
                                        <p className="text-xs text-slate-500 truncate w-full">{b.RoomName}</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md shrink-0 w-fit">
                                    <Clock size={12} className="text-blue-500 shrink-0" />
                                    {b.BookingStartTime} – {b.BookingEndTime}
                                </span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

const CalendarView = ({ bookings, onEdit }) => {
    const [monthCursor, setMonthCursor] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });
    const [selectedDate, setSelectedDate] = useState(null);

    const todayKey = toKey(new Date());

    const bookingsByDay = useMemo(() => {
        const map = new Map();
        bookings.forEach((b) => {
            const key = toKey(b.BookingDate);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(b);
        });
        return map;
    }, [bookings]);

    const gridDays = useMemo(() => {
        const firstOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
        const startOffset = firstOfMonth.getDay(); 
        const gridStart = new Date(firstOfMonth);
        gridStart.setDate(firstOfMonth.getDate() - startOffset);

        return Array.from({ length: 42 }, (_, i) => {
            const d = new Date(gridStart);
            d.setDate(gridStart.getDate() + i);
            return d;
        });
    }, [monthCursor]);

    const goToMonth = (delta) => {
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
        setSelectedDate(null);
    };

    const selectedBookings = selectedDate ? (bookingsByDay.get(toKey(selectedDate)) || []) : [];

    return (
        <div className="w-full box-border">
            <div className="flex items-center justify-between mb-5 w-full">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 truncate">
                    <BookOpen size={20} className="text-blue-600 shrink-0" />
                    <span className="truncate">{MONTH_LABEL(monthCursor)}</span>
                </h2>
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <button
                        onClick={() => goToMonth(-1)}
                        className="p-1.5 md:p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => {
                            const d = new Date();
                            d.setDate(1);
                            setMonthCursor(d);
                            setSelectedDate(null);
                        }}
                        className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-slate-200 text-slate-600 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:text-blue-600 hover:border-blue-300 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => goToMonth(1)}
                        className="p-1.5 md:p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" /> Upcoming
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" /> Past
                </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden w-full box-border">
                <div className="w-full overflow-x-auto overflow-y-hidden box-border" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="min-w-[600px] w-full">
                        <div className="grid grid-cols-7 border-b border-slate-100">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="py-2 md:py-3 text-center text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {gridDays.map((day, idx) => {
                                const key = toKey(day);
                                const inMonth = day.getMonth() === monthCursor.getMonth();
                                const isToday = key === todayKey;
                                const isPast = key < todayKey;
                                const dayBookings = bookingsByDay.get(key) || [];
                                const isSelected = selectedDate && isSameDay(day, selectedDate);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(day)}
                                        className={`min-h-[5.5rem] md:min-h-[6.5rem] p-1.5 md:p-2 border-b border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors ${
                                            inMonth ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60'
                                        } ${isSelected ? 'ring-2 ring-inset ring-blue-500' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span
                                                className={`text-[10px] md:text-xs font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full ${
                                                    isToday
                                                        ? 'bg-blue-600 text-white'
                                                        : inMonth
                                                        ? 'text-slate-700'
                                                        : 'text-slate-300'
                                                }`}
                                            >
                                                {day.getDate()}
                                            </span>
                                            {dayBookings.length > 3 && (
                                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 shrink-0">+{dayBookings.length - 3}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            {dayBookings.slice(0, 3).map((b) => (
                                                <BookingChip
                                                    key={b.BookingID}
                                                    booking={b}
                                                    isPast={isPast}
                                                    onClick={() => setSelectedDate(day)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <DayDetailPanel
                date={selectedDate}
                bookings={selectedBookings}
                todayKey={todayKey}
                onEdit={(b) => onEdit(b.BookingID, b.Title, b.Description, b.BookingStartTime, b.BookingEndTime, b.BookingDate)}
                onClose={() => setSelectedDate(null)}
            />
        </div>
    );
};

function ProfilePage({ onGoBack }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [department, setDepartment] = useState(null);

    const loadData = async () => {
        let user = await fetchData.getUserData();
        const data = await fetchData.fetchUserBookings(user.id);
        setBookings(data || []);
    };

    useEffect(() => {
        const initializeProfile = async () => {
            setLoading(true); 
            try {
                const userData = await fetchData.getUserData();
                setUser(userData);

                const deptUser = await fetchData.getCurrentUser();
                const deptName = await fetchData.GetDepartmentName(parseInt(deptUser.DepartmentID));
                setDepartment(deptName);

                const bookingsData = await fetchData.fetchUserBookings(userData.id);
                setBookings(bookingsData || []);
                
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false); 
            }
        };

        initializeProfile();
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

    return (
        <div 
            className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center box-border" 
            style={{ maxWidth: '100vw', overflowX: 'hidden' }}
        >
            <div className="w-full max-w-4xl box-border">

                <button
                    onClick={onGoBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group w-fit"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
                    <span className="font-medium">Return Home</span>
                </button>

               <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10 mb-8 overflow-hidden relative box-border w-full">
                    {/* Replaced negative margin absolute div with a safe inset top-right div */}
                    <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-blue-50 rounded-full blur-3xl opacity-50 transform translate-x-1/4 -translate-y-1/4 pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full box-border">
                        {loading ? (
                            <>
                                <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-slate-200 rounded-3xl md:rounded-[2rem] animate-pulse" />
                                <div className="text-center md:text-left flex-1 w-full space-y-4">
                                    <div className="space-y-2 flex flex-col items-center md:items-start w-full">
                                        <div className="h-3 w-20 md:w-24 bg-slate-100 rounded animate-pulse" />
                                        <div className="h-8 md:h-10 w-40 md:w-48 bg-slate-200 rounded-xl animate-pulse" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative group shrink-0">
                                    <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl md:rounded-[2rem] flex items-center justify-center text-white shadow-xl md:shadow-2xl shadow-blue-200 transform group-hover:scale-105 transition-transform duration-300">
                                        <UserIcon size={40} strokeWidth={1.5} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-emerald-500 w-5 h-5 md:w-6 md:h-6 rounded-full border-[3px] md:border-4 border-white shadow-sm" />
                                </div>

                                <div className="text-center md:text-left flex-1 min-w-0 w-full">
                                    <div className="flex flex-col gap-1 w-full">
                                        <span className="text-blue-600 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 truncate">Profile</span>
                                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 truncate max-w-full">
                                            {user?.user_metadata?.Firstname || ''}
                                        </h1>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
                                            <span className="flex items-center gap-1.5 text-slate-400 text-xs md:text-sm font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                Click a date to view and edit bookings
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 md:py-20 text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-sm">Fetching your bookings...</p>
                    </div>
                ) : bookings.length > 0 ? (
                    <CalendarView bookings={bookings} onEdit={handleBookingClick} />
                ) : (
                    <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-3xl py-12 md:py-20 flex flex-col items-center justify-center text-slate-400 w-full box-border">
                        <Inbox size={40} className="mb-4 opacity-20 md:w-12 md:h-12" />
                        <p className="font-medium italic text-sm">No bookings found.</p>
                    </div>
                )}
            </div>

            {popupConfig.isOpen && (
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
            )}
        </div>
    );
}

export default ProfilePage;
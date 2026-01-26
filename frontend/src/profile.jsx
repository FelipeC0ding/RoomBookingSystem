import React, { useState, useEffect } from 'react';
import { ChevronDown,Settings,ArrowLeft, Calendar, Clock, BookOpen, User as UserIcon, Inbox } from 'lucide-react';
import fetchData from './DAL/FetchData';
import PopUp from './PopUps/editBooking';

function ProfilePage({ onGoBack }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noBookingsPending, setPending] = useState(0)
    const [user, setUser] = useState(null)
    const [department, setDepartment] = useState(null)

    useEffect(() => {
        const getUser = async () => {
            const userData = await fetchData.getUserData();
            console.log(userData)
            let dept = await fetchData.getCurrentUser() 
            dept = dept.DepartmentID
            dept = await fetchData.GetDepartmentName(parseInt(dept))
            setUser(userData);
            setDepartment(dept)
            console.log('User:', userData)
        }
        getUser();

    }, []);

    useEffect(() => {
        const getPendingNo = () => {
            let count = 0
            for (let i = 0; i < bookings.length; i++) {
                if (new Date(bookings[i].BookingDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) {
                    count = count += 1;
                }
            }
            setPending(count);
        }

        getPendingNo();
    }, [bookings]);

    const loadData = async () => {
        let user = await fetchData.getUserData();
        const data = await fetchData.fetchUserBookings(user.id);
        setBookings(data)
    }

    useEffect(() => {

        const getBookings = async () => {
            try {
                let user = await fetchData.getUserData();
                const data = await fetchData.fetchUserBookings(user.id);
                setBookings(data)
            }
            catch (error) {
                console.error("Error loading profile:", error);
            }
            finally {
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
        })

    }



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
                                    
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <div className="h-8 w-32 bg-slate-100 rounded-full animate-pulse" />
                                        <div className="h-4 w-40 bg-slate-50 rounded animate-pulse" />
                                    </div>
                                </div>

                                <div className="hidden md:block w-px h-16 bg-slate-100 mx-4" />

                                <div className="bg-slate-50 rounded-[2rem] p-8 min-w-[180px] flex flex-col items-center gap-2">
                                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                                    <div className="h-12 w-12 bg-slate-200 rounded animate-pulse" />
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
                                            {user?.user_metadata.Firstname || 'User'}
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
                                        <span className="text-white text-5xl font-black leading-none">{noBookingsPending}</span>
                                        <span className="text-blue-400 text-[11px] font-bold mt-2 uppercase">Upcoming</span>
                                    </div>
                                </div>
                                
                            </>
                            
                        )}
                        
                    </div>
                    
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <BookOpen size={22} className="text-blue-600" />
                        My Current Bookings
                    </h2>


                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>Fetching you bookings...</p>
                        </div>


                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            new Date(booking.BookingDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0) ? (
                                <div
                                    key={booking.BookingID}
                                    onClick={() => handleBookingClick(booking.BookingID, booking.Title, booking.Description, booking.BookingStartTime, booking.BookingEndTime, booking.BookingDate)}
                                    className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="hidden sm:flex w-12 h-12 bg-slate-50 rounded-xl items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{booking.RoomName}</h3>
                                            <div className="mt-3 space-y-3">
                                                {/* Primary Content: Title & Description */}
                                                <div className="space-y-1">
                                                    <h4 className="text-base font-semibold text-slate-800 leading-tight">
                                                        {booking.Title}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 line-clamp-2 italic">
                                                        "{booking.Description}"
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-100">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                                        <Calendar size={13} className="text-blue-500" />
                                                        {new Date(booking.BookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>

                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                                        <Clock size={13} className="text-blue-500" />
                                                        {booking.BookingStartTime} – {booking.BookingEndTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                            Upcoming
                                        </span>
                                    </div>
                                </div>
                            ) : (null)

                        ))
                    ) : (
                        <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-slate-400">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="font-medium italic">No bookings found in your history.</p>
                        </div>
                    )}


                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <BookOpen size={22} className="text-blue-600" />
                        My Booking History
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>Loading your history...</p>
                        </div>
                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            new Date(booking.BookingDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
                                <div
                                    key={booking.BookingID}
                                    className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="hidden sm:flex w-12 h-12 bg-slate-50 rounded-xl items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{booking.RoomName}</h3>
                                            <div className="flex flex-wrap gap-4 mt-1">
                                                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Calendar size={14} /> {new Date(booking.BookingDate).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Clock size={14} /> {booking.BookingStartTime} - {booking.BookingEndTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                            ) : (null)

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
};

export default ProfilePage;
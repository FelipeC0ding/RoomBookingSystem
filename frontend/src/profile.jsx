import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, BookOpen, User as UserIcon, Inbox } from 'lucide-react';
import fetchData from './DAL/FetchData';

function ProfilePage ({ onGoBack}){
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noBookingsPending, setPending] = useState(0)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const getUser =async ()=>{
            const userData = await fetchData.getUserData();
            setUser(userData);
            console.log('User:',userData)
        }
        getUser();

    }, []);

    useEffect(() =>{
        const getPendingNo =()=>{
            let count = 0
            for(let i = 0; i < bookings.length; i++){
                if(new Date(bookings[i].BookingDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)){
                    count = count+=1;
                }
            }
            setPending(count);
        }

        getPendingNo();
    },[bookings]);

    useEffect(() =>{

        const getBookings = async ()=> {
            try{
                let user = await fetchData.getUserData();
                const data = await fetchData.fetchUserBookings(user.id);
                console.log('bookings:',data)
                setBookings(data)
            }
            catch(error){
                console.error("Error loading profile:", error);
            }
            finally{
                setLoading(false);
            }

        }
        getBookings();

    },[]);



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

                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <UserIcon size={48} />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-slate-900">{user?.user_metadata.Firstname}</h1>
                            <p className="text-slate-500 mt-1">Manage your room reservations and history</p>
                        </div>

                        {/* Booking Count Stat */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-center min-w-[140px]">
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Upcoming Bookings</p>
                            <p className="text-white text-4xl font-black">{noBookingsPending}</p>
                        </div>
                    </div>
                </div>

                {/* Bookings List Section */}
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


                    ):bookings.length > 0 ? (
                           bookings.map((booking) => (
                               new Date(booking.BookingDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) ? (
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

                                                   {/* Metadata Row: Date, Time, and Room */}
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
                               ):(null)

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
                            new Date(booking.BookingDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? (
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
                            ):(null)

                        ))
                    ) : (
                        <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-slate-400">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="font-medium italic">No bookings found in your history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
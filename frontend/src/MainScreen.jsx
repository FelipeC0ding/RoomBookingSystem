import React, { useState, useEffect } from 'react';
import { User, ShieldAlert,Settings, LogOut, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import AdminPage from './Admin.jsx';
import fetchData from './DAL/FetchData.js'
import timeCalcs from './calculations/TimeCalcs.js'
import PopUp from './PopUps/BookRoom.jsx';
import ProfilePage from './profile.jsx'

function Menu(props) {
    const [rooms, setRooms] = useState([]);
    const [selectedRoomForWeek, setSelectedRoomForWeek] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState([]);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(props.viewDate);
        const dayOfWeek = d.getDay();
        const diffToMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
        d.setDate(d.getDate() - diffToMonday + i);
        
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        async function getRoomsToDisplay() {
            const data = await fetchData.getRooms()
            setRooms(data)
            if (data.length > 0 && !selectedRoomForWeek) setSelectedRoomForWeek(data[0].RoomID);
        }
        getRoomsToDisplay()
    }, [])

    useEffect(() => {
        if(rooms.length>0){
            console.log(rooms)
            console.log('loading date. Rooms^^')
            loadData();

        }
    },[props.viewDate, props.viewType,selectedRoomForWeek, rooms]);

    let filteredRooms = rooms.filter(room => 
        room.RoomName.toLowerCase().includes(props.roomFilter.toLowerCase())
    );

    const [popupConfig, setPopupConfig] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        roomID: 0,
        targetDate: '',
        timeDuration: ''
    });

    const loadData = async () => {
        setIsLoading(true);
        const activeRoomID = selectedRoomForWeek || (rooms.length > 0 ? rooms[0].RoomID : null);
        if(!activeRoomID){
//            setBookings([]);
            return;
        }
        try {
            let data = []
            if(props.viewType === 'week'){
                let startDate = new Date(props.viewDate);
                let dayOfWeek = startDate.getDay();
                let daysToSubtract = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
                startDate.setDate(startDate.getDate() - daysToSubtract)

                let endDate = new Date(startDate)
                endDate.setDate(startDate.getDate()+6)
                console.log(startDate,'     ', endDate)
                console.log('selected room',selectedRoomForWeek)
                data = await fetchData.fetchBookingsWeek(selectedRoomForWeek, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
            }
            else{
                data = await fetchData.fetchBookings(props.viewDate, props.viewType);
            }
            setBookings([...(data || [])]);
        } finally {
            setIsLoading(false);
        }
    };

    const bookingMap = {};
    (bookings || []).forEach(b => {
        // Ensure we are only looking at the YYYY-MM-DD part of the database date
        const dbDate = new Date(b.BookingDate).toISOString().split('T')[0];
        const key = `${String(b.RoomID)}-${dbDate}-${String(b.BookingStartTime.substring(0, 5))}`;
        bookingMap[key] = b;
    });

    

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* 1. Sleek Title Banner */}
            <div className="w-full max-w-5xl px-4 pt-6 flex flex-col gap-4">
                <div className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm">
                    <div className="relative flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.3em]">Live Dashboard</span>
                            </div>
                            <h1 className="text-xl font-light text-slate-800 tracking-tight">Main <span className="font-semibold text-blue-600">Menu</span></h1>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active Session</span>
                            <span className="text-xs font-semibold text-slate-600">
                                {new Date(props.viewDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Compact Control Bar */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="relative w-64 group">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={props.roomFilter}
                            onChange={(e) => props.setRoomFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Filter Rooms..."
                        />
                    </div>
                    <div className="relative group">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="date"
                            value={props.viewDate}
                            onChange={(e) => props.setViewDate(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Day/Week Selector */}
                    <select 
                        value={props.viewType}
                        onChange={(e) => props.setViewType(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                    </select>

                    {/* NEW: Room selector appears beside Day/Week picker ONLY when week is selected */}
                    {props.viewType === 'week' && (
                        <select 
                            value={selectedRoomForWeek} 
                            onChange={(e) => setSelectedRoomForWeek(parseInt(e.target.value))}
                            className="bg-blue-50 border border-blue-100 text-blue-600 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer animate-in fade-in slide-in-from-left-2 duration-200"
                        >
                            {rooms.map(r => (
                                <option key={r.RoomID} value={r.RoomID}>
                                    Viewing: {r.RoomName}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="flex-1" />
                    <div className="flex gap-2">
                        <button onClick={props.handleAdminClick} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Settings size={20}/></button>
                        <button onClick={props.handleProfilePageClick} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><User size={20}/></button>
                        <button onClick={props.handleLogoutClick} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><LogOut size={20}/></button>
                    </div>
                </div>
            </div>

            {/* 3. Grid Logic */}
            <div className="w-full flex-1 overflow-auto p-6 flex justify-center">
                <div className="inline-flex bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden h-fit">
                    <div className="w-24 bg-gray-50/50 border-r border-gray-200 flex-shrink-0">
                        <div className="h-12 border-b border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                            Time
                        </div>
                        {props.timePeriods.map((time, i) => (
                            <div key={i} className="h-20 border-b border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500">
                                {time}
                            </div>
                        ))}
                    </div>

                    {(props.viewType === 'day' ? filteredRooms : weekDays).map((item, colIdx) => {
                        const isDay = props.viewType === 'day';
                        const currentRoomID = isDay ? item.RoomID : selectedRoomForWeek;
                        const currentDate = isDay ? props.viewDate : item;

                        return (
                            <div key={colIdx} className="w-64 border-r border-gray-200 last:border-r-0 flex-shrink-0">
                                <div className="h-12 border-b border-gray-200 bg-white flex flex-col items-center justify-center px-4">
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate w-full text-center">
                                        {isDay ? item.RoomName : new Date(item).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                                    </span>
                                    {isDay && <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{item.Capacity} Seats</span>}
                                </div>

                                {props.timePeriods.map((range, idx) => {
                                    const formattedRange = range.substring(0, 5);
                                    const currentBooking = bookingMap[`${String(currentRoomID)}-${currentDate}-${String(formattedRange)}`];
                                    
                                    return (
                                        <div key={idx} className="h-20 border-b border-gray-50 p-2 flex items-center justify-center">
                                            {currentBooking ? (
                                                <div className="w-full h-full bg-slate-800 rounded-lg p-2.5 text-white shadow-sm flex flex-col justify-center border-l-4 border-blue-500 overflow-hidden">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                        <span className="text-[10px] font-bold uppercase truncate">{currentBooking.Title}</span>
                                                    </div>
                                                    <span className="text-[14px] opacity-60 font-medium truncate ml-3">
                                                        {currentBooking.User.Firstname} {currentBooking.User.Surname}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setPopupConfig({
                                                        isOpen: true,
                                                        type: 'success',
                                                        title: 'Make a booking',
                                                        message: `Booking for ${currentDate}`,
                                                        roomID: currentRoomID,
                                                        targetDate: currentDate,
                                                        timeDuration: `${range}`
                                                    })}
                                                    className="text-[10px] font-bold text-emerald-500 tracking-tight hover:scale-105 transition-transform"
                                                >
                                                    + Available
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

           <PopUp
                isOpen={popupConfig.isOpen}
                type={popupConfig.type}
                title={popupConfig.title}
                message={popupConfig.message}
                roomID={popupConfig.roomID}
                timeDuration={popupConfig.timeDuration}
                // Correctly uses the specific date clicked in the grid
                bookingDate={popupConfig.targetDate}
                onClose={async () => {
                    // 1. Close UI immediately
                    setPopupConfig(prev => ({ ...prev, isOpen: false }));
                    
                    // 2. Delay slightly so Supabase has time to finish the loop of inserts
                    setTimeout(async () => {
                        await loadData();
                    }, 200); // 200ms is usually the sweet spot for bulk inserts
                }}
            />
        </div>
    );
}

function MainScreen({ onLogout }) {
    const [roomFilter, setRoomFilter] = useState('');
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewType, setViewType] = useState('day'); 
    const [adminPage, setAdminPage] = useState(false);
    const [profilePage, setProfilePage] = useState(false)
    const [timePeriods, setTimePeriods] = useState([])
    const [userRole, setUserRole] = useState('')

    useEffect(() => {
        async function timePeriodsHeader() {
            const data = await timeCalcs.getTimeHeaders()
            setTimePeriods(data)
        }
        timePeriodsHeader()
    }, [])

    useEffect(() => {
        async function checkUserRole() {
            let data = (await fetchData.getCurrentUser());
            if (data) setUserRole(data.Role.toUpperCase())
        }
        checkUserRole()
    }, [])

    useEffect(() => {
        if (adminPage && userRole !== 'ADMIN') {
            alert("Security: You do not have permission to access admin page.");
            setAdminPage(false);
        }
    }, [adminPage, userRole]);

    if (profilePage) return <ProfilePage onGoBack={() => setProfilePage(false)} />;
    if (adminPage && userRole === 'ADMIN') return <AdminPage onGoBack={() => setAdminPage(false)} />;

    return (
        <Menu
            roomFilter={roomFilter}
            setRoomFilter={setRoomFilter}
            viewDate={viewDate}
            setViewDate={setViewDate}
            viewType={viewType}
            setViewType={setViewType}
            handleAdminClick={() => setAdminPage(true)}
            handleLogoutClick={onLogout}
            handleProfilePageClick={() => setProfilePage(true)}
            timePeriods={timePeriods}
        />
    );
}

export default MainScreen;
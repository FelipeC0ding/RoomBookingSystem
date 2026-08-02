import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldAlert, Settings, LogOut, Filter, Calendar } from 'lucide-react';
import AdminPage from './Admin.jsx';
import fetchData from './DAL/FetchData.js'
import timeCalcs from './calculations/TimeCalcs.js'
import PopUp from './PopUps/BookRoom.jsx';
import ErrorPopUp from './PopUps/ErrorPopUp.jsx';
import ProfilePage from './profile.jsx'
import { supabase } from './supabaseClient'
import { getUserColour } from './colourUtils';

function Menu(props) {
    const [rooms, setRooms] = useState([]);
    const [selectedRoomForWeek, setSelectedRoomForWeek] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [dragState, setDragState] = useState({
        isDragging: false,
        colKey: null,
        startIdx: -1,
        currentIdx: -1,
        item: null
    });

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(props.viewDate);
        const dayOfWeek = d.getDay();
        const diffToMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
        d.setDate(d.getDate() - diffToMonday + i);
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        async function getRoomsToDisplay() {
            const data = await fetchData.getRooms();
            setRooms(data || []);
            if (data && data.length > 0 && !selectedRoomForWeek) {
                setSelectedRoomForWeek(data[0].RoomID);
            }
            if (data === null) {
                handleErrorMessage('Your account setup is not complete. Contact your admin');
            }
        }
        getRoomsToDisplay();
    }, []);

    const [popupConfig, setPopupConfig] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        roomID: 0,
        bookingDate: '', 
        timeDuration: ''
    });

    const handleErrorMessage = (msg) => {
        setErrorMessage(msg);
        setShowError(true);
    };

    const loadData = async (showLoadingScreen = true) => {
        if (showLoadingScreen) {
            setIsLoading(true);
        }
        
        const activeRoomID = selectedRoomForWeek || (rooms.length > 0 ? rooms[0].RoomID : null);
        if (!activeRoomID && props.viewType === 'week') {
            if (showLoadingScreen) setIsLoading(false);
            return;
        }

        try {
            let data = [];
            if (props.viewType === 'week') {
                const startDate = new Date(weekDays[0]);
                const endDate = new Date(weekDays[6]);
                data = await fetchData.fetchBookingsWeek(activeRoomID, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
            } else {
                data = await fetchData.fetchBookings(props.viewDate, props.viewType);
            }
            setBookings([...(data || [])]);
        } catch (error) {
            console.error("Failed to load bookings", error);
        } finally {
            if (showLoadingScreen) {
                setTimeout(() => setIsLoading(false), 300);
            }
        }
    };

    useEffect(() => {
        if (rooms.length > 0) {
            loadData(true);
        }
    }, [props.viewDate, props.viewType, selectedRoomForWeek, rooms]);

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (dragState.isDragging) {
                openDragBooking();
            }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [dragState]);

    const handleMouseDown = (colKey, item, idx) => {
        setDragState({
            isDragging: true,
            colKey,
            startIdx: idx,
            currentIdx: idx,
            item
        });
    };

    const handleMouseEnter = (colKey, idx) => {
        if (dragState.isDragging && dragState.colKey === colKey) {
            setDragState(prev => ({ ...prev, currentIdx: idx }));
        }
    };

    const openDragBooking = () => {
        if (!dragState.isDragging || dragState.startIdx === -1) return;
        
        const minIdx = Math.min(dragState.startIdx, dragState.currentIdx);
        const maxIdx = Math.max(dragState.startIdx, dragState.currentIdx);
        
        const startTime = props.timePeriods[minIdx].substring(0, 5);
        
        let endTime = "";
        if (maxIdx + 1 < props.timePeriods.length) {
            endTime = props.timePeriods[maxIdx + 1].substring(0, 5);
        } else {
            const [h, m] = props.timePeriods[maxIdx].substring(0, 5).split(':').map(Number);
            endTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        const isDay = props.viewType === 'day';
        const currentRoomID = isDay ? dragState.item.RoomID : selectedRoomForWeek;
        const exactColumnDate = isDay ? props.viewDate : dragState.item;

        setPopupConfig({
            isOpen: true,
            type: 'success',
            title: 'Make a booking',
            message: `Booking for ${exactColumnDate}`,
            roomID: currentRoomID,
            bookingDate: exactColumnDate,
            timeDuration: `${startTime} - ${endTime}`
        });

        setDragState({ isDragging: false, colKey: null, startIdx: -1, currentIdx: -1, item: null });
    };

    const filteredRooms = rooms.filter(room =>
        room.RoomName.toLowerCase().includes(props.roomFilter.toLowerCase())
    );

    const bookingMap = {};

    (bookings || []).forEach(b => {
        const dbDate = new Date(b.BookingDate).toISOString().split('T')[0];
        
        const startStr = b.BookingStartTime ? b.BookingStartTime.substring(0, 5) : null;
        const endStr = b.BookingEndTime ? b.BookingEndTime.substring(0, 5) : null;

        if (startStr && endStr) {
            let isInsideBooking = false;
            
            props.timePeriods.forEach((period) => {
                const currentPeriod = period.substring(0, 5);
                
                if (currentPeriod === startStr) isInsideBooking = true;
                if (currentPeriod === endStr) isInsideBooking = false;

                if (isInsideBooking) {
                    const key = `${String(b.RoomID)}-${dbDate}-${currentPeriod}`;
                    bookingMap[key] = b;
                }
            });
        } else if (startStr) {
            const key = `${String(b.RoomID)}-${dbDate}-${startStr}`;
            bookingMap[key] = b;
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center select-none w-full max-w-[100vw] overflow-x-hidden">
            <div className="w-full max-w-5xl px-4 pt-6 flex flex-col gap-4">
                <div className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm">
                    <div className="relative flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-xl font-light text-slate-800 tracking-tight">Booking Page</h1>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-lg md:text-xl font-semibold text-slate-600">
                                {new Date(props.viewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* MODIFIED: Flex wrap added to prevent toolbar from expanding page width */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3 w-full">
                    <div className="relative flex-1 min-w-[140px]">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={props.roomFilter}
                            onChange={(e) => props.setRoomFilter(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Find Room"
                        />
                    </div>
                    
                    <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="date"
                            value={props.viewDate}
                            onChange={(e) => props.setViewDate(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-[140px]"
                        />
                    </div>

                    <select
                        value={props.viewType}
                        onChange={(e) => props.setViewType(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                    </select>

                    {props.viewType === 'week' && (
                        <select
                            value={selectedRoomForWeek || ""}
                            onChange={(e) => setSelectedRoomForWeek(parseInt(e.target.value))}
                            className="bg-blue-50 border border-blue-100 text-blue-600 rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer flex-1 min-w-[120px]"
                        >
                            {rooms.map(r => (
                                <option key={r.RoomID} value={r.RoomID}>
                                    {r.RoomName}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="flex gap-1 ml-auto">
                        <button onClick={props.handleAdminClick} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Settings size={20} /></button>
                        <button onClick={props.handleProfilePageClick} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><User size={20} /></button>
                        <button onClick={props.handleLogoutClick} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><LogOut size={20} /></button>
                    </div>
                </div>
            </div>

            {/* MODIFIED: Forced this wrapper to be strictly scrollable horizontally */}
            <div className="w-full flex-1 overflow-x-auto p-4 md:p-6 flex justify-start md:justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 mx-auto w-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Fetching schedule...</p>
                    </div>
                ) : (
                    <div className="inline-flex bg-white rounded-xl shadow-xl border border-gray-200 h-fit min-w-max">
                        <div className="w-20 md:w-24 bg-gray-50/50 border-r border-gray-200 flex-shrink-0 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div className="h-12 border-b border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">
                                Time
                            </div>
                            {props.timePeriods.map((time, i) => (
                                <div key={i} className="h-20 border-b border-gray-100 flex items-center justify-center text-[10px] md:text-[11px] font-bold text-gray-500 bg-gray-50/50">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {(props.viewType === 'day' ? filteredRooms : weekDays).map((item, colIdx) => {
                            const isDay = props.viewType === 'day';
                            const currentRoomID = isDay ? item.RoomID : selectedRoomForWeek;
                            const exactColumnDate = isDay ? props.viewDate : item;
                            
                            const columnKey = `${currentRoomID}-${exactColumnDate}`;

                            return (
                                <div key={colIdx} className="w-48 md:w-64 border-r border-gray-200 last:border-r-0 flex-shrink-0">
                                    <div className="h-12 border-b border-gray-200 bg-white flex flex-col items-center justify-center px-2 md:px-4">
                                        <span className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate w-full text-center">
                                            {isDay ? item.RoomName : new Date(item).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                                        </span>
                                        {isDay && <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{item.Capacity} Seats</span>}
                                    </div>

                                    {props.timePeriods.map((range, idx) => {
                                        const formattedRange = range.substring(0, 5);
                                        const currentBooking = bookingMap[`${String(currentRoomID)}-${exactColumnDate}-${String(formattedRange)}`];

                                        const isSelected = dragState.isDragging && 
                                            dragState.colKey === columnKey && 
                                            idx >= Math.min(dragState.startIdx, dragState.currentIdx) && 
                                            idx <= Math.max(dragState.startIdx, dragState.currentIdx);
                                            
                                        const userColorClass = currentBooking ? getUserColour(currentBooking.UserID) : '';

                                        return (
                                            <div 
                                                key={idx} 
                                                className={`h-20 border-b border-gray-50 p-1.5 md:p-2 flex items-center justify-center transition-colors ${
                                                    isSelected ? 'bg-blue-100/70 border-blue-400/50' : 'hover:bg-gray-50 cursor-pointer'
                                                }`}
                                                onMouseDown={(e) => {
                                                    if (!currentBooking) {
                                                        e.preventDefault(); 
                                                        handleMouseDown(columnKey, item, idx);
                                                    }
                                                }}
                                                onMouseEnter={() => {
                                                    if (!currentBooking) handleMouseEnter(columnKey, idx);
                                                }}
                                            >
                                                {currentBooking ? (
                                                    <div className={`w-full h-full rounded-lg p-2 shadow-sm flex flex-col justify-center overflow-hidden cursor-default ${userColorClass}`}>
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                                                            <span className="text-[9px] md:text-[10px] font-bold uppercase truncate">{currentBooking.Title}</span>
                                                        </div>
                                                        <span className="text-[12px] md:text-[14px] opacity-80 font-medium truncate ml-3">
                                                            {currentBooking.User?.Firstname} {currentBooking.User?.Surname}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className={`text-[9px] md:text-[10px] font-bold tracking-tight hover:scale-105 transition-transform ${
                                                        isSelected ? 'text-blue-600' : 'text-emerald-500'
                                                    }`}>
                                                        {isSelected ? 'Release to Book' : '+ Available'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <PopUp
                isOpen={popupConfig.isOpen}
                type={popupConfig.type}
                title={popupConfig.title}
                message={popupConfig.message}
                roomID={popupConfig.roomID}
                timeDuration={popupConfig.timeDuration}
                bookingDate={popupConfig.bookingDate} 
                onClose={async (returnedError) => {
                    setPopupConfig(prev => ({ ...prev, isOpen: false }));
                    await loadData(false);
                    if (returnedError && typeof returnedError === 'string') {
                        handleErrorMessage(returnedError);
                    }
                }}
            />
            <ErrorPopUp
                message={errorMessage}
                isOpen={showError}
                onClose={() => setShowError(false)}
            />
        </div>
    );
}

function MainScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAccessDenied, setIsAccessDenied] = useState(false);
    const [roomFilter, setRoomFilter] = useState('');
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewType, setViewType] = useState('day');
    const [activePage, setActivePage] = useState('menu'); 
    const [timePeriods, setTimePeriods] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [userConfirmed, setUserConfirmed] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const navigate = useNavigate(); 

    useEffect(() => {
        async function loadInitialData() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !user) {
                    navigate('/login');
                    return;
                }

                const { data, error: profileError } = await supabase.rpc('get_my_profile');
                const profile = data && data.length > 0 ? data[0] : null;

                if (profileError || !profile || !profile.Firstname) {
                    setErrorMessage("You do not have access. Your account isn't set up correctly. Please use your official invite link.");
                    setShowError(true);
                    setIsAccessDenied(true); 
                    setIsLoading(false); 
                    return; 
                }

                setUserRole(profile.Role ? profile.Role.toUpperCase() : 'STANDARD');
                setUserConfirmed(profile.Confirmed);

                const times = await timeCalcs.getTimeHeaders();
                setTimePeriods(times);
            } catch (error) {
                console.error("Initialization error:", error);
                navigate('/login');
            } finally {
                if (!isAccessDenied) {
                    setIsLoading(false);
                }
            }
        }
        
        loadInitialData();
    }, [navigate, isAccessDenied]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login'); 
    };

    const handleNavigation = (target) => {
        if (!userConfirmed) {
            setErrorMessage('Your account has not been verified. Please contact your IT admin.');
            setShowError(true);
            return;
        }

        if (target === 'admin' && userRole !== 'ADMIN') {
            setErrorMessage("Security: You do not have permission to access the admin page.");
            setShowError(true);
            return;
        }

        setActivePage(target);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs animate-pulse">
                    Verifying Profile Details...
                </p>
            </div>
        );
    }

    if (isAccessDenied) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <ErrorPopUp
                    message={errorMessage}
                    isOpen={showError}
                    onClose={() => {
                        setShowError(false);
                        handleLogout(); 
                    }}
                />
            </div>
        );
    }

    if (activePage === 'admin' && userRole === 'ADMIN' && userConfirmed) {
        return <AdminPage onGoBack={() => setActivePage('menu')} />;
    }

    if (activePage === 'profile' && userConfirmed) {
        return <ProfilePage onGoBack={() => setActivePage('menu')} />;
    }

    return (
        <>
            <Menu
                roomFilter={roomFilter}
                setRoomFilter={setRoomFilter}
                viewDate={viewDate}
                setViewDate={setViewDate}
                viewType={viewType}
                setViewType={setViewType}
                handleAdminClick={() => handleNavigation('admin')}
                handleLogoutClick={handleLogout}
                handleProfilePageClick={() => handleNavigation('profile')}
                timePeriods={timePeriods}
            />
            
            <ErrorPopUp
                message={errorMessage}
                isOpen={showError}
                onClose={() => setShowError(false)}
            />
        </>
    );
}

export default MainScreen;
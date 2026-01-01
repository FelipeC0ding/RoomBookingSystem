import React, { useState,useEffect } from 'react';
import { Settings, LogOut, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import AdminPage from './Admin.jsx';
import AuthFlow from './AuthFlow';
import fetchData from './DAL/FetchData'
import timeCalcs from './calculations/TimeCalcs'
import PopUp from './PopUps/BookRoom';

function LabeledInput({ label, icon: Icon, children }) {
    return (
        <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-gray-600 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <Icon size={14} className="text-blue-500" />
                {label}
            </label>
            {children}
        </div>
    );
}

function Menu(props) {

    const [popupConfig, setPopupConfig] = useState({
                isOpen: false,
                type: 'success',
                title: '',
                message: '',
                roomID:0,
                timeDuration:''
            });
    const [bookings, setBookings] = useState([]);

    const loadData = async () => {
        const data = await fetchData.fetchBookings(props.viewDate);
        setBookings(data);

    };

    useEffect(() => {
        loadData();
    }, [props.viewDate]);

    const bookingMap = {};
    bookings.forEach(b => {
        const key = `${String(b.RoomID)}-${String(b.BookingStartTime.substring(0, 5))}`;
        bookingMap[key] = b;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex flex-col md:flex-row items-end gap-6">

                    <LabeledInput label="Filter Rooms" icon={Filter}>
                        <input
                            type="text"
                            value={props.roomFilter}
                            onChange={(e) => props.setRoomFilter(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g., IT Lab B"
                        />
                    </LabeledInput>

                    <LabeledInput label="View Date" icon={Calendar}>
                        <input
                            type="date"
                            value={props.viewDate}
                            onChange={(e) => props.setViewDate(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </LabeledInput>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            onClick={props.handleNewBooking}
                        >
                            Filter
                        </button>

                        <button
                            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                            onClick={props.handleAdminClick}
                            title="Admin Settings"
                        >
                            <Settings size={24} />
                        </button>

                        <button
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                            onClick={props.handleLogoutClick}
                            title="Logout"
                        >
                            <LogOut size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex h-screen overflow-hidden bg-gray-50">
              {/* 1. Your existing Sidebar */}
              <aside className="w-64 border-r border-gray-200 bg-white flex-shrink-0">
                <div className="h-12 border-b border-gray-200 flex items-center px-4 font-semibold text-gray-700 bg-white sticky top-0">
                  Rooms
                </div>
                {props.rooms.map((room) => (
                  <div key={room.RoomID} className="h-[100px] p-4 border-b border-gray-100 flex flex-col justify-center bg-white">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{room.RoomName}</h3>
                    <p className="text-sm text-slate-500 mt-1">{room.Capacity} seats, {room.Features}</p>
                  </div>
                ))}
              </aside>

              {/* 2. The New Dynamic Time Grid */}
              <main className="flex-1 overflow-x-auto overflow-y-auto">
                <div className="inline-min-w-full">

                  {/* Header Row */}
                  <div className="flex sticky top-0 z-10 bg-white border-b border-gray-200">
                    {props.timePeriods.map((range, index) => (
                      <div
                        key={index}
                        className="w-56 h-12 flex-shrink-0 border-r border-gray-200 flex items-center justify-center font-semibold text-gray-600 text-sm"
                      >
                        {range}
                      </div>
                    ))}
                  </div>

                  {/* Grid Rows */}
                  {props.rooms.map((room) => (
                    <div key={`row-${room.RoomID}`} className="flex border-b border-gray-100">
                      {props.timePeriods.map((range, index) => {
                        // 1. Variable definition inside the map requires { } and return
                        const formattedRange = range.substring(0,5)
                        const currentBooking = bookingMap[`${String(room.RoomID)}-${String(formattedRange)}`];
                        console.log(formattedRange)
                        return (
                          <div
                            key={`${room.RoomID}-${index}`}
                            className="w-56 h-[100px] flex-shrink-0 border-r border-gray-100 flex items-center justify-center bg-white transition-colors hover:bg-gray-50 p-2"
                          >
                            {currentBooking ? (
                              /* --- DISPLAY BOOKED SLOT (RED CARD) --- */
                              <div className="h-full w-full bg-red-600 rounded-xl p-3 text-white shadow-md flex flex-col justify-between group cursor-default animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                                  <CheckCircle2 size={14} className="flex-shrink-0" />
                                  <span className="truncate">{currentBooking.Title}</span>
                                </div>
                                <div className="text-[11px] opacity-90 leading-tight">
                                  <p className="font-medium">{range}</p>
                                  <p className="truncate italic">
                                     {currentBooking.Description || 'No description'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              /* --- DISPLAY AVAILABLE BUTTON --- */
                              <button
                                className="text-green-500 text-sm font-semibold hover:scale-110 transition-transform flex items-center gap-1"
                                onClick={() => setPopupConfig({
                                  isOpen: true,
                                  type: 'success',
                                  title: 'Make a booking',
                                  message: `Booking ${room.RoomName}`,
                                  roomID: room.RoomID,
                                  timeDuration: `${range} - ${props.timePeriods[index + 1] || 'End'}`
                                })}
                              >
                                <span className="text-lg">+</span> Available
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                </div>
              </main>
            </div>

            <PopUp
                isOpen={popupConfig.isOpen}
                type={popupConfig.type}
                title={popupConfig.title}
                message={popupConfig.message}
                roomID={popupConfig.roomID}
                timeDuration={popupConfig.timeDuration}
                bookingDate = {props.viewDate}
                onClose={async () => {
                    setPopupConfig({ ...popupConfig, isOpen: false });
                    await loadData();
                }}


            />
        </div>
    );
}

function MainScreen() {
    const [roomFilter, setRoomFilter] = useState('');
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [adminPage, setAdminPage] = useState(false);
    const [logout, setLogout] = useState(false);
    const [Departments, setDepartments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [timePeriods, setTimePeriods] = useState([])
    const handleAdminClick = () => setAdminPage(!adminPage);
    const handleGoBack = () => setAdminPage(false);
    const handleLogoutClick = () => setLogout(true);

    function handleNewBooking() {
        alert(`New Booking for ${viewDate} with filter: ${roomFilter}`);
    }

    if (logout) {
        return <AuthFlow />;
    }

    if (adminPage) {
        return <AdminPage onGoBack={handleGoBack} />;
    }

    useEffect(()=>{
        async function getRoomsToDisplay(){
            const data = await fetchData.getRooms()
            setRooms(data)
        }

        getRoomsToDisplay()
    }, [])

    useEffect(()=>{
            async function timePeriodsHeader(){
                const data = await timeCalcs.getTimeHeaders()
                setTimePeriods(data)
            }

            timePeriodsHeader()
        }, [])
    return (
        <Menu
            roomFilter={roomFilter}
            setRoomFilter={setRoomFilter}
            viewDate={viewDate}
            setViewDate={setViewDate}
            handleNewBooking={handleNewBooking}
            handleAdminClick={handleAdminClick}
            handleLogoutClick={handleLogoutClick}
            rooms = {rooms}
            timePeriods = {timePeriods}
        />
    );
}

export default MainScreen;
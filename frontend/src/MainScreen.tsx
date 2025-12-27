import React, { useState,useEffect } from 'react';
import { Settings, LogOut, Filter, Calendar } from 'lucide-react';
import AdminPage from './Admin.jsx';
import AuthFlow from './AuthFlow';
import fetchData from './DAL/FetchData'
// Pure Tailwind LabeledInput
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

            <aside className="w-64 border-r border-gray-200 bg-white">

              <div className="h-12 border-b border-gray-200 flex items-center px-4 font-semibold text-gray-700">
                  Rooms
              </div>

              {props.rooms.map((room) => (
                  <div
                    key={room.RoomID}
                    className="h-[100px] p-4 border-b border-gray-100 flex flex-col justify-center transition-colors hover:bg-gray-50"
                  >
                    {/* Room Name */}
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                      {room.RoomName}
                    </h3>

                    {/* Capacity & Features */}
                    <p className="text-sm text-slate-500 mt-1">
                      {room.Capacity} seats, {room.Features}
                    </p>
                  </div>
                ))}

            </aside>
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
        />
    );
}

export default MainScreen;
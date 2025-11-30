import React, { useState } from 'react';
import { Plus, Calendar, Settings } from 'lucide-react';

// --- 0. LabeledInput Helper Component (Defined outside for clarity) ---
const LabeledInput = ({ label, children }) => (
    <div className="flex flex-col flex-grow min-w-[150px] mb-4 md:mb-0">
        <label className="text-gray-700 font-semibold text-sm mb-1">{label}</label>
        {children}
    </div>
);


// --- 1. Menu Component (Layout) ---
function Menu({
    roomFilter,
    setRoomFilter,
    viewDate,
    setViewDate,
    // FIX 1: Handlers must be explicitly received as props
    handleNewBooking,
    handleAdminClick
}) {
    // FIX 2: Opening parenthesis must be on the same line as return
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-6xl mx-auto border border-gray-100">
            {/* Responsive Flex Container */}
            <div className="flex flex-col md:flex-row md:items-end gap-4">

                {/* 1. Filter Rooms Input */}
                <LabeledInput label="Filter Rooms">
                    <div className="relative">
                        <input
                            type="text"
                            value={roomFilter}
                            onChange={(e) => setRoomFilter(e.target.value)}
                            placeholder="e.g., IT Lab B, Projector, Ci..."
                            className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>
                </LabeledInput>

                {/* 2. View Date Input */}
                <LabeledInput label="View Date">
                    <div className="relative flex items-center">
                        <input
                            type="date"
                            value={viewDate}
                            onChange={(e) => setViewDate(e.target.value)}
                            className="appearance-none w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-700"
                        />
                        {/* Calendar Icon */}
                        <Calendar size={20} className="absolute right-3 text-gray-400 pointer-events-none" />
                    </div>
                </LabeledInput>

                {/* Spacer to align buttons to the right */}
                <div className="flex-grow hidden md:block" />


                {/* 3. New Booking Button (Primary Action) */}
                <button
                    // Handler is now available
                    onClick={handleNewBooking}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 min-w-[150px] whitespace-nowrap"
                >
                    <Plus size={20} />
                    <span>New Booking</span>
                </button>

                {/* 4. Admin Button (Secondary Action) */}
                <button
                    // Handler is now available
                    onClick={handleAdminClick}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-300 transition duration-200 min-w-[100px]"
                >
                    <Settings size={20} />
                    <span>Admin</span>
                </button>
            </div>
        </div>
    );
}

// --- 2. Main FilterBar Component (State Manager) ---
function FilterBar() {
    // State management for inputs
    const [roomFilter, setRoomFilter] = useState('');
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

    // Button handler functions
    const handleNewBooking = () => {
        alert(`New Booking for ${viewDate} with filter: ${roomFilter}`);
    };

    const handleAdminClick = () => {
        alert("Navigating to Admin Panel...");
    };

    // FilterBar returns the Menu component, passing down state and handlers as props.
    return (
        <Menu
            roomFilter={roomFilter}
            setRoomFilter={setRoomFilter}
            viewDate={viewDate}
            setViewDate={setViewDate}
            handleNewBooking={handleNewBooking} // Passed down to Menu
            handleAdminClick={handleAdminClick}   // Passed down to Menu
        />
    );
}

export default FilterBar;
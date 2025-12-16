import React, { useState } from 'react';
import { Plus, Calendar, Settings } from 'lucide-react';
import { Monitor } from 'lucide-react';
import AdminPage from './Admin.jsx'
import SignUp from './SignUp.jsx'
function LabeledInput({ label, children }){
    return(
            <div className="flex flex-col flex-grow min-w-[150px] mb-4 md:mb-0">
                <label className="text-gray-700 font-semibold text-sm mb-1">{label}</label>
                {children}
            </div>
        )
};


function Menu(props)
{
    return (
        <div className="container p-3 bg-white rounded shadow">
          <div className="row g-3 align-items-end">
            <div className="col-md">
              <LabeledInput label="Filter Rooms">
                <input
                  type="text"
                  value={props.roomFilter}
                  onChange={(e) => props.setRoomFilter(e.target.value)}
                  className="form-control"
                  placeholder="e.g., IT Lab B"
                />
              </LabeledInput>
            </div>

            <div className="col-md">
              <LabeledInput label="View Date">
                <input
                  type="date"
                  value={props.viewDate}
                  onChange={(e) => props.setViewDate(e.target.value)}
                  className="form-control"
                />
              </LabeledInput>
            </div>

            <div className="col-auto d-flex gap-2">
              <button className="btn btn-primary" onClick={props.handleNewBooking}>
                Filter
              </button>

              <button className="btn btn-secondary" onClick={props.handleAdminClick}>
                              <Settings size={20} className="me-1" /> Admin
              </button>
            </div>
          </div>
        </div>
    );
}

function FilterBar() {
    const [roomFilter, setRoomFilter] = useState('');
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [adminPage, setAdminPage] = useState(false);

    const handleAdminClick = () =>{
            setAdminPage(prevValue => !prevValue)
            }

    const handleGoBack = () =>{
        setAdminPage(false)
        }

    function handleNewBooking(){
        alert(`New Booking for ${viewDate} with filter: ${roomFilter}`);
    };

    return (
        adminPage ? (<AdminPage onGoBack={handleGoBack} />) : (
                <Menu
                    roomFilter={roomFilter}
                    setRoomFilter={setRoomFilter}
                    viewDate={viewDate}
                    setViewDate={setViewDate}
                    handleNewBooking={handleNewBooking}
                    handleAdminClick={handleAdminClick}
                />
            )
    );
}
export default FilterBar;
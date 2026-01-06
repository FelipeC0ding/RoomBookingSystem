import React, { useState } from 'react';
import { Monitor, Users, Settings, ArrowLeft } from 'lucide-react';
import ManageUsers from './ManageUsers';
import ManageRooms from './ManageRooms';
import { supabase } from './supabaseClient';
import FetchData from './DAL/FetchData'
// Consistent Tailwind-only classes
const TAB_CLASSES = "flex items-center justify-center gap-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer font-semibold text-gray-700 shadow-sm transition-all hover:border-blue-400 hover:shadow-md active:scale-95";

function AdminPage({ onGoBack }) {
    const [manageUsers, setManageUsers] = useState(false)
    const [manageRooms, setManageRooms] = useState(false)

    const handleManageRoomClick = ()=>{
        setManageRooms(!manageRooms)
    }

    const onSwitch = () =>{

        setManageRooms(false)
    }

    if(manageRooms){
        return <ManageRooms onGoBack={onSwitch} />;
    }
    
    
    
    const handleManageUserCLick = ()=>{
        setManageUsers(!manageUsers)
    }

    const onclickBack = () =>{

        setManageUsers(false)
    }

    if(manageUsers){
        return <ManageUsers onGoBack={onclickBack} />;
    }


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <Settings className="text-blue-600" /> Admin Panel
                        </h2>
                        <p className="text-gray-500 mt-1">System configuration and management</p>
                    </div>
                    <button
                        onClick={onGoBack}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Menu
                    </button>
                </div>

                {/* Management Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <button 
                        type="button" 
                        className={TAB_CLASSES}
                        onClick = {handleManageUserCLick}
                        >

                        <Users size={24} className="text-blue-500" />
                        <span>Manage Users</span>
                    </button>

                    <button 
                        type="button" 
                        onClick={handleManageRoomClick} 
                        className={TAB_CLASSES}>
                        <Monitor size={24} className="text-green-500" />
                        <span>Manage Rooms</span>
                    </button>

                    <button type="button" onClick={onGoBack} className={TAB_CLASSES}>
                        <Settings size={24} className="text-purple-500" />
                        <span>System Settings</span>
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                        className="w-full md:w-auto px-6 py-3 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        onClick={onGoBack}
                    >
                        Exit Admin
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
import React from 'react';
import { Monitor, Users, Settings } from 'lucide-react';
import { supabase } from './supabaseClient';

const TAB_CLASSES = "flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400";

function AdminPage({ onGoBack }) {

    const handleManageUsersClick = async () => {
        console.log("--- Executing Supabase Insert ---");

        const { data, error } = await supabase
            .from('User')
            .insert([
                {
                    UserEmail: 'testingemail',
                    Firstname: 'hello',
                    Surname: 'Hello',
                    Role: 'teacher',
                    DepartmentID: 1
                }
            ]);

        if (error) {
            console.error('ERROR inserting User:', error);
            alert(`ERROR: Insert failed. Check console for details. (Is RLS ON?)`);
        } else {
            console.log('SUCCESS:', data);
            alert('SUCCESS: Test user added to database!');
        }
    };

    return (
        <div className="container p-4 bg-light rounded shadow mt-4">
            <h2 className="mb-4">⚙️ Welcome to the Admin Panel!</h2>
            <p className="mb-4">Select a management area below:</p>

            <div className="d-flex flex-wrap gap-3 mb-5">

                <button
                    type="button"
                    // ✅ LINKED: Calls the correct, working function directly
                    onClick={handleManageUsersClick}
                    className={TAB_CLASSES}
                >
                    <Users size={20} className="text-gray-700" />
                    Manage Users (Test Insert)
                </button>

                <button
                    type="button"
                    onClick={onGoBack}
                    className={TAB_CLASSES}
                >
                    <Monitor size={20} className="text-gray-700" />
                    Manage Rooms
                </button>

                <button
                    type="button"
                    onClick={onGoBack}
                    className={TAB_CLASSES}
                >
                    <Settings size={20} className="text-gray-700" />
                    Manage Settings
                </button>

            </div>

            <button className="btn btn-danger mt-3" onClick={onGoBack}>
                Go Back to Main Menu
            </button>
        </div>
    );
}
export default AdminPage;
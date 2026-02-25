import React, { useEffect, useState } from 'react';
import fetchData from './DAL/FetchData';
import { 
  ArrowLeft, UserMinus, ShieldCheck, ShieldAlert, 
  CheckCircle, XCircle, Users 
} from 'lucide-react';
import { supabase } from './supabaseClient';

function ManageUsers({ onGoBack }) {
    const [activeTab, setActiveTab] = useState('active');
    const [users, setUsers] = useState([]);
    const [confirmingAdminId, setConfirmingAdminId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [currentUser, setCurrentUser] = useState('')
    useEffect(() => {
        async function getUsers() {
            const data = await fetchData.getAllUsers();
            setUsers(data || []);
        }
        getUsers();
    }, []);

    const activeList = users.filter(u => u.Confirmed);
    const pendingList = users.filter(u => !u.Confirmed);
    const displayedUsers = activeTab === 'active' ? activeList : pendingList;

    const handleApprove = async (userID) => {
        await fetchData.approveUser(userID);
        setUsers(prev => prev.map(u =>
            u.UserID === userID ? { ...u, Confirmed: true } : u
        ));
    };

    const handleDeny = async()=>{
        await fetchData.deleteUser(userID);
        setUsers(prev => prev.map(u =>
            u.UserID === userID ? { ...u, Confirmed: true } : u
        ));
    }
    const handleToggleAdmin = async (user) => {
        if (!user) {
            setConfirmingAdminId(null);
            return;
        }

        const isAdmin = user.Role.toUpperCase() === 'ADMIN';
        const newRole = isAdmin ? 'standard' : 'admin';

        if (isAdmin) {
            await fetchData.removeAdmin(user.UserID);
        } else {
            await fetchData.makeAdmin(user.UserID);
        }

        setUsers(prev => prev.map(u => 
            u.UserID === user.UserID ? { ...u, Role: newRole } : u
        ));
        
        setConfirmingAdminId(null);
    };

    const handleInviteUser = async (email) =>{
        try{
            console.log(email)
            const {data,error} = await supabase.functions.invoke('invite-student',{
                body: {email:email},
            })

        }
        catch(error){
            console.log(error.message)
        }

    }

    const handleDeleteUser = async (userId) => {
        await fetchData.deleteUser(userId);
        const {data,error} = await supabase.functions.invoke('delete-user',{
            body: {UserID:userId},
        })
        setUsers(prev => prev.filter(u => u.UserID !== userId));
        setConfirmingDeleteId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <button onClick={onGoBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all mb-2">
                            <ArrowLeft size={18} /> Back to Panel
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Operations</h1>
                    </div>

                    <div className="flex bg-slate-200 p-1 rounded-xl">
                        <button onClick={() => setActiveTab('active')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>
                            Active Staff ({activeList.length})
                        </button>
                        <button onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600'}`}>
                            Requests ({pendingList.length})
                        </button>
                    </div>
                </div>

                <div className="flex justify-start items-center gap-8 mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Invite a user:</h2>
                    <button
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[12px] tracking-widest uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                        onClick ={()=>{
                            const email = window.prompt('Enter the email address');
                            if(email){handleInviteUser(email)}
                        }}
                    >
                        Invite!
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px]  font-black tracking-widest">
                                <th className="px-8 py-5">User Identity</th>
                                <th className="px-8 py-5 text-center">Current Role</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedUsers.map((user) => (
                                <tr key={user.UserID} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 text-slate-900 font-bold">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${user.Role.toUpperCase() === 'ADMIN' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                {user.Firstname?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{user.Firstname} {user.Surname}</span>
                                                <span className="text-xs font-normal text-slate-500">{user.UserEmail}</span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[14px] font-black ring-1 ${user.Role.toUpperCase() === 'ADMIN' ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                                            {user.Role === 'admin' ? 'Administrator' : 'Standard User'}
                                        </span>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-3 items-center">
                                            {activeTab === 'active' ? (
                                                <>
                                                    {/* ROLE TOGGLE SECTION */}
                                                    {confirmingAdminId === user.UserID ? (
                                                        <div className="flex gap-2 animate-in slide-in-from-right-1">
                                                            <button 
                                                                onClick={() => handleToggleAdmin(user)} 
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-[10px]  tracking-tight shadow-md hover:bg-blue-700 transition-all"
                                                            >
                                                                Confirm 
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmingAdminId(null)}
                                                                className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-[10px]  hover:bg-slate-200 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setConfirmingAdminId(user.UserID);
                                                                setConfirmingDeleteId(null);
                                                            }} 
                                                            className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-wider transition-all shadow-sm ring-1 ring-inset ${
                                                                user.Role.toUpperCase() === 'ADMIN' 
                                                                ? 'bg-red-50 text-red-600 ring-red-200 hover:bg-red-600 hover:text-white' 
                                                                : 'bg-blue-50 text-blue-600 ring-blue-200 hover:bg-blue-600 hover:text-white'
                                                            }`}
                                                        >
                                                            {user.Role.toUpperCase() === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                                                        </button>
                                                    )}

                                                    {/* VISUAL DIVIDER */}
                                                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                                    
                                                    {/* DELETE SECTION */}
                                                    {confirmingDeleteId === user.UserID ? (
                                                        <div className="flex gap-2 animate-in slide-in-from-right-1">
                                                            <button 
                                                                onClick={() => handleDeleteUser(user.UserID)} 
                                                                className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] "
                                                            >
                                                                Yes, Delete
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmingDeleteId(null)} 
                                                                className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-[10px] "
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setConfirmingDeleteId(user.UserID);
                                                                setConfirmingAdminId(null);
                                                            }} 
                                                            className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <UserMinus size={18} />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                /* Pending Tab Logic */
                                                <div className="flex gap-2">
                                                    <button
                                                        className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] hover:bg-green-600 hover:text-white transition-all ring-1 ring-green-200"
                                                        onClick={() => handleApprove(user.UserID)} // Use user.UserID from the map function
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all ring-1 ring-red-200"
                                                        onClick={() => handleDeleteUser(user.UserID)} // Usually "Deny" for a new request is just deleting the record
                                                    >
                                                        Deny
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ManageUsers;
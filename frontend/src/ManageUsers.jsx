import React, { useEffect, useState } from 'react';
import fetchData from './DAL/FetchData';
import InviteUser from './InviteUser';
import { ArrowLeft, UserMinus, Lock } from 'lucide-react';
import { supabase } from './supabaseClient';

function ManageUsers({ onGoBack }) {
    const [activeTab, setActiveTab] = useState('active');
    const [users, setUsers] = useState([]);
    
    // UI State for confirmations
    const [confirmingAdminId, setConfirmingAdminId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [confirmingUnlockId, setConfirmingUnlockId] = useState(null); // NEW: Inline unlock confirmation
    
    // NEW: Professional Toast Notification State
    const [toast, setToast] = useState(null); 
    
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // NEW: Helper function to show professional alerts
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000); // Auto-dismiss after 4 seconds
    };

    useEffect(() => {
        async function getUsers() {
            const data = await fetchData.getAllUsers();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error("Database Error: Expected an array of users, but received:", data);
                setUsers([]);
            }
        }
        getUsers();
    }, []);

    const activeList = users.filter(u => u.Confirmed);
    const pendingList = users.filter(u => !u.Confirmed);
    const lockedList = users.filter(u => u.IsLocked); 

    let displayedUsers = [];
    if (activeTab === 'active') displayedUsers = activeList;
    else if (activeTab === 'pending') displayedUsers = pendingList;
    else if (activeTab === 'locked') displayedUsers = lockedList;

    const handleApprove = async (userID) => {
        await fetchData.approveUser(userID);
        setUsers(prev => prev.map(u =>
            u.UserID === userID ? { ...u, Confirmed: true } : u
        ));
        showToast("User approved successfully.");
    };

    const handleDeny = async (userID) => {
        await fetchData.deleteUser(userID);
        setUsers(prev => prev.filter(u => u.UserID !== userID));
        showToast("User request denied.");
    };

    const handleToggleAdmin = async (user) => {
        if (!user) {
            setConfirmingAdminId(null);
            return;
        }

        const isAdmin = user.Role.toUpperCase() === 'ADMIN';
        const newRole = isAdmin ? 'standard' : 'admin';

        try {
            if (isAdmin) {
                await fetchData.removeAdmin(user.UserID);
            } else {
                await fetchData.makeAdmin(user.UserID);
            }

            setUsers(prev => prev.map(u => 
                u.UserID === user.UserID ? { ...u, Role: newRole } : u
            ));
            
            showToast(`Role updated to ${newRole === 'admin' ? 'Administrator' : 'Standard User'}.`);
        } catch (error) {
            showToast("Failed to update user role.", "error");
        }
        setConfirmingAdminId(null);
    };

    const handleInviteUser = async (email) => {
        try {
            const { data, error } = await supabase.functions.invoke('invite-student', {
                body: { email: email },
            });
            if (error) throw error;
            showToast(`Invitation sent to ${email}`);
        } catch (error) {
            console.log(error.message);
            showToast(error.message, "error");
        }
    };

    const handleUnlockUser = async (user) => {
        try {
            const { error } = await supabase.rpc('admin_unlock_user', {
                user_email: user.UserEmail
            });

            if (error) throw error;

            // Use our new professional notification
            showToast(`${user.Firstname} has been successfully unlocked.`);
            
            setUsers(prev => prev.map(u => 
                u.UserID === user.UserID ? { ...u, IsLocked: false } : u
            ));

        } catch (error) {
            console.error("Unlock Error:", error);
            showToast(`Failed to unlock user: ${error.message}`, "error");
        } finally {
            setConfirmingUnlockId(null); // Reset the inline UI
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { userId: userId },
            });
            if (error) throw error;
            
            setUsers(prev => prev.filter(u => u.UserID !== userId));
            showToast("User deleted successfully.");
        } catch (error) {
            showToast("Failed to delete user.", "error");
        }
        setConfirmingDeleteId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans relative">
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
                        <button onClick={() => setActiveTab('locked')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'locked' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600'}`}>
                            <Lock size={14} /> Locked ({lockedList.length})
                        </button>
                    </div>
                </div>

                <div className="flex justify-start items-center gap-8 mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Invite users:</h2>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[12px] tracking-widest uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                    >
                        Invite Team
                    </button>
                </div>

                <InviteUser 
                    isOpen={isInviteModalOpen} 
                    onClose={() => setIsInviteModalOpen(false)} 
                    onInviteUser={handleInviteUser} 
                />

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black tracking-widest">
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
                                            
                                            {/* ACTIVE TAB ACTIONS */}
                                            {activeTab === 'active' && (
                                                <>
                                                    {confirmingAdminId === user.UserID ? (
                                                        <div className="flex gap-2 animate-in slide-in-from-right-1">
                                                            <button 
                                                                onClick={() => handleToggleAdmin(user)} 
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] tracking-tight shadow-md hover:bg-blue-700 transition-all"
                                                            >
                                                                Confirm 
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmingAdminId(null)}
                                                                className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-all"
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

                                                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                                    
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
                                            )}

                                            {/* PENDING TAB ACTIONS */}
                                            {activeTab === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] hover:bg-green-600 hover:text-white transition-all ring-1 ring-green-200"
                                                        onClick={() => handleApprove(user.UserID)} 
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all ring-1 ring-red-200"
                                                        onClick={() => handleDeny(user.UserID)}
                                                    >
                                                        Deny
                                                    </button>
                                                </div>
                                            )}

                                            {/* LOCKED TAB ACTIONS */}
                                            {activeTab === 'locked' && (
                                                <>
                                                    {confirmingUnlockId === user.UserID ? (
                                                        <div className="flex gap-2 animate-in slide-in-from-right-1">
                                                            <button 
                                                                onClick={() => handleUnlockUser(user)}
                                                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] tracking-tight shadow-md hover:bg-emerald-700 transition-all"
                                                            >
                                                                Confirm Unlock
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmingUnlockId(null)}
                                                                className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setConfirmingUnlockId(user.UserID)}
                                                            className="px-4 py-2 rounded-xl font-black text-[10px] tracking-wider transition-all shadow-sm ring-1 ring-inset bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-600 hover:text-white"
                                                        >
                                                            Unlock User
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* NEW: FLOATING TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-8 z-50 ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                }`}>
                    {toast.message}
                </div>
            )}

        </div>
    );
}

export default ManageUsers;
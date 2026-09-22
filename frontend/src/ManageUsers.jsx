import React, { useEffect, useState } from 'react';
import fetchData from './DAL/FetchData';
import InviteUser from './InviteUser';
import ErrorPopup from './PopUps/ErrorPopUp';
import { ArrowLeft, UserMinus, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from './supabaseClient';
import { validateUuid, validateEmail } from './lib/validation.js';

function ManageUsers({ onGoBack }) {
    const [activeTab, setActiveTab] = useState('active');
    const [users, setUsers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    
    const [confirmingAdminId, setConfirmingAdminId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [confirmingUnlockId, setConfirmingUnlockId] = useState(null); 
    
    const [toast, setToast] = useState(null); 
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000); 
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setIsErrorPopupOpen(true);
    };

    const fetchUsers = async () => {
        const data = await fetchData.getAllUsers();
        if (Array.isArray(data)) {
            setUsers(data);
        } else {
            console.error("Database Error: Expected an array of users, but received:", data);
            setUsers([]);
        }
    };

    useEffect(() => {
        let isMounted = true;
        let userChannel = null;

        async function initRealtimeAndData() {
            try {
                const sessionUser = await fetchData.getUserData();
                if (isMounted && sessionUser) {
                    setCurrentUserId(sessionUser.id);
                }
            } catch (err) {
                console.error("Error fetching session user:", err);
            }

            const data = await fetchData.getAllUsers();
            if (isMounted) {
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Database Error: Expected an array of users, but received:", data);
                    setUsers([]);
                }
            }

            // Ensure session token is attached to Realtime connection for RLS authorization
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    await supabase.realtime.setAuth(session.access_token);
                }
            } catch (authErr) {
                console.warn("Realtime setAuth warning:", authErr);
            }

            if (!isMounted) return;

            // Use unique channel to avoid collisions with closing/stale channels on unmount/remount
            const channelId = `users-realtime-${Date.now()}`;
            userChannel = supabase.channel(channelId);

            const handleUserChange = (payload) => {
                console.log('Realtime change received for User:', payload);
                if (isMounted) {
                    fetchUsers();
                }
            };

            userChannel
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'User' },
                    handleUserChange
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'user' },
                    handleUserChange
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'auth_login_attempts' },
                    handleUserChange
                )
                .subscribe((status, err) => {
                    if (err) {
                        console.error('Realtime User subscription error:', err);
                    }
                    console.log('Realtime User subscription status:', status);
                });
        }

        initRealtimeAndData();

        return () => {
            isMounted = false;
            if (userChannel) {
                supabase.removeChannel(userChannel);
            }
        };
    }, []);

    const activeList = users.filter(u => u.Confirmed);
    const pendingList = users.filter(u => !u.Confirmed);
    const lockedList = users.filter(u => u.IsLocked); 

    let displayedUsers = [];
    if (activeTab === 'active') displayedUsers = activeList;
    else if (activeTab === 'pending') displayedUsers = pendingList;
    else if (activeTab === 'locked') displayedUsers = lockedList;

    const totalPages = Math.ceil(displayedUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = displayedUsers.slice(startIndex, startIndex + itemsPerPage);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); 
    };

    const handleApprove = async (userID) => {
        const idVal = validateUuid(userID, 'User ID');
        if (!idVal.isValid) {
            showError(idVal.error);
            return;
        }
        try {
            await fetchData.approveUser(userID);
            setUsers(prev => prev.map(u =>
                u.UserID === userID ? { ...u, Confirmed: true } : u
            ));
            showToast("User approved successfully.");
        } catch (error) {
            showError("Failed to approve user: " + (error.message || error));
        }
    };

    const handleDeny = async (userID) => {
        const idVal = validateUuid(userID, 'User ID');
        if (!idVal.isValid) {
            showError(idVal.error);
            return;
        }
        try {
            await fetchData.deleteUser(userID);
            setUsers(prev => prev.filter(u => u.UserID !== userID));
            showToast("User request denied.");
        } catch (error) {
            showError("Failed to deny user request: " + (error.message || error));
        }
    };

    // <--- 3. UPDATED TOGGLE ADMIN LOGIC --->
    const handleToggleAdmin = async (user) => {
        if (!user) {
            setConfirmingAdminId(null);
            return;
        }

        const idVal = validateUuid(user.UserID, 'User ID');
        if (!idVal.isValid) {
            setConfirmingAdminId(null);
            showError(idVal.error);
            return;
        }

        const isAdmin = user.Role.toUpperCase() === 'ADMIN';
        const newRole = isAdmin ? 'standard' : 'admin';
        const originalRole = user.Role;

        setConfirmingAdminId(null);

        setUsers(prev => prev.map(u => 
            u.UserID === user.UserID ? { ...u, Role: newRole } : u
        ));

        try {
            if (isAdmin) {
                await fetchData.removeAdmin(user.UserID);
            } else {
                await fetchData.makeAdmin(user.UserID);
            }
            
            showToast(`Role updated to ${newRole === 'admin' ? 'Administrator' : 'Standard User'}.`);
            
        } catch (error) {
            setUsers(prev => prev.map(u => 
                u.UserID === user.UserID ? { ...u, Role: originalRole } : u
            ));
            
            const msg = error.message || "Failed to update user role.";
            showError(msg); 
        }
    };

    const formatInviteErrorMessage = (rawError, email = '') => {
        const msg = (typeof rawError === 'string' ? rawError : rawError?.message || '').toLowerCase();

        if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
            return email 
                ? `The user "${email}" already exists or has already been invited.` 
                : `This user already exists or has already been invited.`;
        }
        if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
            return `Email rate limit exceeded. Please wait a moment before sending more invitations.`;
        }
        if (msg.includes('invalid email') || msg.includes('unable to validate')) {
            return email 
                ? `"${email}" is not a valid email address.` 
                : `Invalid email address provided.`;
        }
        if (msg.includes('smtp') || msg.includes('sending invite email')) {
            return `Failed to send invitation email to ${email || 'user'}. Please check email configuration.`;
        }
        if (msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('permission')) {
            return `You do not have permission to invite users.`;
        }

        return (typeof rawError === 'string' ? rawError : rawError?.message) || `Failed to send invitation to ${email || 'user'}.`;
    };

    const handleInviteUser = async (email) => {
        try {
            const { data, error } = await supabase.functions.invoke('invite-student', {
                body: { email: email },
            });

            let rawErrorMsg = '';
            if (error) {
                try {
                    if (error.context && typeof error.context.json === 'function') {
                        const body = await error.context.json();
                        rawErrorMsg = body.error || body.message || error.message;
                    } else {
                        rawErrorMsg = error.message;
                    }
                } catch (e) {
                    rawErrorMsg = error.message;
                }
            }

            if (rawErrorMsg) {
                const formatted = formatInviteErrorMessage(rawErrorMsg, email);
                return { success: false, email, error: formatted };
            }

            return { success: true, email };
        } catch (error) {
            const formatted = formatInviteErrorMessage(error.message, email);
            return { success: false, email, error: formatted };
        }
    };

    const handleUnlockUser = async (user) => {
        if (!user) {
            setConfirmingUnlockId(null);
            return;
        }
        const idVal = validateUuid(user.UserID, 'User ID');
        if (!idVal.isValid) {
            setConfirmingUnlockId(null);
            showError(idVal.error);
            return;
        }
        const emailVal = validateEmail(user.UserEmail);
        if (!emailVal.isValid) {
            setConfirmingUnlockId(null);
            showError(emailVal.error);
            return;
        }

        try {
            const { error } = await supabase.rpc('admin_unlock_user', {
                user_email: user.UserEmail
            });

            if (error) throw error;
            showToast(`${user.Firstname} has been successfully unlocked.`);
            
            setUsers(prev => prev.map(u => 
                u.UserID === user.UserID ? { ...u, IsLocked: false } : u
            ));

        } catch (error) {
            console.error("Unlock Error:", error);
            showError(`Failed to unlock user: ${error.message}`); // Updated to use Popup
        } finally {
            setConfirmingUnlockId(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        const idVal = validateUuid(userId, 'User ID');
        if (!idVal.isValid) {
            setConfirmingDeleteId(null);
            showError(idVal.error);
            return;
        }
        try {
            await fetchData.deleteUser(userId);
            
            setUsers(prev => prev.filter(u => u.UserID !== userId));
            showToast("User deleted successfully.");
            
            if (paginatedUsers.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (error) {
            showError("Failed to delete user: " + (error.message || error)); // Updated to use Popup
        }
        setConfirmingDeleteId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans relative w-full max-w-[100vw] overflow-x-hidden">
            <div className="max-w-6xl mx-auto w-full">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 w-full">
                    <div>
                        <button onClick={onGoBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all mb-2">
                            <ArrowLeft size={18} /> Back to Panel
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">User Operations</h1>
                    </div>

                    <div className="flex flex-wrap bg-slate-200 p-1 rounded-xl w-fit">
                        <button onClick={() => handleTabChange('active')}
                            className={`px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>
                            Active ({activeList.length})
                        </button>
                        <button onClick={() => handleTabChange('pending')}
                            className={`px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600'}`}>
                            Requests ({pendingList.length})
                        </button>
                        <button onClick={() => handleTabChange('locked')}
                            className={`px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all flex items-center gap-1 md:gap-2 ${activeTab === 'locked' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600'}`}>
                            <Lock size={14} /> Locked ({lockedList.length})
                        </button>
                    </div>
                </div>

                <div className="flex justify-start items-center gap-4 md:gap-8 mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800">Invite users:</h2>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[11px] md:text-[12px] tracking-widest uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                    >
                        Invite User
                    </button>
                </div>

                <InviteUser 
                    isOpen={isInviteModalOpen} 
                    onClose={(isSuccess) => {
                        setIsInviteModalOpen(false);
                        if (isSuccess) {
                            showToast("Invitation(s) sent successfully.");
                        }
                    }} 
                    onInviteUser={handleInviteUser} 
                />

                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-full flex flex-col">
                    <div className="w-full max-w-full overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black tracking-widest">
                                    <th className="px-6 py-4 md:py-5">User</th>
                                    <th className="px-6 py-4 md:py-5 text-center">Role</th>
                                    <th className="px-6 py-4 md:py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.UserID} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-slate-900 font-bold">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white ${user.Role.toUpperCase() === 'ADMIN' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                        {user.Firstname?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{user.Firstname} {user.Surname}</span>
                                                        <span className="text-xs font-normal text-slate-500">{user.UserEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[12px] md:text-[14px] font-black ring-1 ${user.Role.toUpperCase() === 'ADMIN' ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                                                    {user.Role === 'admin' ? 'Administrator' : 'Standard User'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2 md:gap-3 items-center">
                                                    
                                                    {/* NEW CHECK: If this is the current user, just show a "You" badge */}
                                                    {user.UserID === currentUserId ? (
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-default select-none">
                                                            You
                                                        </span>
                                                    ) : (
                                                        /* Otherwise, show all the normal action buttons */
                                                        <>
                                                            {activeTab === 'active' && (
                                                                <>
                                                                    {confirmingAdminId === user.UserID ? (
                                                                        <div className="flex gap-1 md:gap-2 animate-in slide-in-from-right-1">
                                                                            <button 
                                                                                onClick={() => handleToggleAdmin(user)} 
                                                                                className="bg-blue-600 text-white px-3 py-2 rounded-xl font-bold text-[10px] tracking-tight shadow-md hover:bg-blue-700 transition-all shrink-0"
                                                                            >
                                                                                Confirm 
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setConfirmingAdminId(null)}
                                                                                className="bg-slate-100 text-slate-500 px-3 py-2 rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-all shrink-0"
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
                                                                            className={`px-3 py-2 rounded-xl font-black text-[10px] tracking-wider transition-all shadow-sm ring-1 ring-inset whitespace-nowrap ${
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
                                                                        <div className="flex gap-1 md:gap-2 animate-in slide-in-from-right-1">
                                                                            <button 
                                                                                onClick={() => handleDeleteUser(user.UserID)} 
                                                                                className="bg-red-600 text-white px-3 py-2 rounded-xl font-bold text-[10px] shrink-0"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setConfirmingDeleteId(null)} 
                                                                                className="bg-slate-100 text-slate-500 px-3 py-2 rounded-xl font-bold text-[10px] shrink-0"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => {
                                                                                setConfirmingDeleteId(user.UserID);
                                                                                setConfirmingAdminId(null);
                                                                            }} 
                                                                            className="p-2 text-slate-300 hover:text-red-600 transition-colors shrink-0"
                                                                            title="Delete User"
                                                                        >
                                                                            <UserMinus size={18} />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}

                                                            {activeTab === 'pending' && (
                                                                <div className="flex gap-1 md:gap-2">
                                                                    <button
                                                                        className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] hover:bg-green-600 hover:text-white transition-all ring-1 ring-green-200"
                                                                        onClick={() => handleApprove(user.UserID)} 
                                                                    >
                                                                        Approve
                                                                    </button>

                                                                    <button
                                                                        className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all ring-1 ring-red-200"
                                                                        onClick={() => handleDeny(user.UserID)}
                                                                    >
                                                                        Deny
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {activeTab === 'locked' && (
                                                                <>
                                                                    {confirmingUnlockId === user.UserID ? (
                                                                        <div className="flex gap-1 md:gap-2 animate-in slide-in-from-right-1">
                                                                            <button 
                                                                                onClick={() => handleUnlockUser(user)}
                                                                                className="bg-emerald-600 text-white px-3 py-2 rounded-xl font-bold text-[10px] tracking-tight shadow-md hover:bg-emerald-700 transition-all shrink-0"
                                                                            >
                                                                                Confirm
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setConfirmingUnlockId(null)}
                                                                                className="bg-slate-100 text-slate-500 px-3 py-2 rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-all shrink-0"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => setConfirmingUnlockId(user.UserID)}
                                                                            className="px-3 py-2 rounded-xl font-black text-[10px] tracking-wider transition-all shadow-sm ring-1 ring-inset bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-600 hover:text-white whitespace-nowrap shrink-0"
                                                                        >
                                                                            Unlock User
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500 font-medium">
                                            No users found in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                            <span className="text-xs md:text-sm font-bold text-slate-500">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, displayedUsers.length)} of {displayedUsers.length}
                            </span>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Existing Success Toasts */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-8 z-50 whitespace-nowrap ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* <--- 4. RENDER YOUR NEW ERROR POPUP ---> */}
            <ErrorPopup 
                isOpen={isErrorPopupOpen} 
                message={errorMessage} 
                onClose={() => setIsErrorPopupOpen(false)} 
            />
            
        </div>
    );
}

export default ManageUsers;
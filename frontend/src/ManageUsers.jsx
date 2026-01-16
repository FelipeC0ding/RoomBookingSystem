import React, { useEffect, useState } from 'react';
import fetchData from './DAL/FetchData'

import { 
  ArrowLeft, 
  Search, 
  UserMinus, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Users
} from 'lucide-react';

function ManageUsers({ onGoBack }) {
    const [activeTab, setActiveTab] = useState('active');
    const [confirmingAdminId, setConfirmingAdminId] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(()=>{
        async function getUsers(){
            let activeUsers_ = [];
            let pendingUsers_ = [];
            const data = await fetchData.getAllUsers() 
            setUsers(data)
            for(let index = 0; index<data.length; index++){
                if(data[index].Confirmed){
                    activeUsers_.push(data[index])

                }
                else{
                    pendingUsers_.push(data[index])
                }
            }
            setActiveUsers(activeUsers_);
            setPendingUsers(pendingUsers_);
        }
        getUsers();


    },[])

    const handleToggleAdmin = (userId) => {
        setUsers(users.map(u => 
            u.id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u
        ));
        setConfirmingAdminId(null);
    };

    const handleDeleteUser = (userId) => {
        setUsers(users.filter(u => u.id !== userId));
        setConfirmingDeleteId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <button 
                            onClick={onGoBack}
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all mb-2"
                        >
                            <ArrowLeft size={18} /> Back to Panel
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Operations</h1>
                    </div>

                    <div className="flex bg-slate-200 p-1 rounded-xl">
                        <button 
                            onClick={() => {setActiveTab('active'); setConfirmingAdminId(null);}}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Active Staff ({activeUsers.length})
                        </button>
                        <button 
                            onClick={() => {setActiveTab('pending'); setConfirmingAdminId(null);}}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Requests ({pendingUsers.length})
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                <th className="px-8 py-5">User Identity</th>
                                <th className="px-8 py-5 text-center">Current Role</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(activeTab === 'active' ? activeUsers : pendingUsers).map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            {/* The Icon */}
                                            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-black text-white shadow-sm
                                                ${user.role === 'admin' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                {user.Firstname?.charAt(0).toUpperCase()}
                                            </div>
                                            
                                            {/* The Names */}
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                                                    {user.Firstname} {user.Surname}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium lowercase">
                                                    {user.UserEmail}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-8 py-6 text-center">
                                        {user.Role.toUpperCase() === 'ADMIN' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase ring-1 ring-blue-700/10">
                                                <ShieldCheck size={14} /> Administrator
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase">
                                                Standard User
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-3 items-center">
                                            {activeTab === 'active' ? (
                                                <>
                                                    {/* ROLE TOGGLE WITH CANCEL OPTION */}
                                                    {confirmingAdminId === user.UserID ? (
                                                        <div className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                                                            <button 
                                                                onClick={() => {handleToggleAdmin(user.UserID); fetchData.makeAdmin(user.UserID);}}
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmingAdminId(null)}
                                                                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-300 transition-all"
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
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
                                                                user.Role.toUpperCase() === 'ADMIN' 
                                                                ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' 
                                                                : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                                                            }`}
                                                        >
                                                            {user.Role.toUpperCase() === 'ADMIN' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                                            {user.Role.toUpperCase() === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                                                        </button>
                                                    )}

                                                    <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                                    
                                                    {/* DELETE USER WITH CANCEL OPTION */}
                                                    {confirmingDeleteId === user.UserID ? (
                                                        <div className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                                                            <button 
                                                                onClick={() => handleDeleteUser(user.UserID)}
                                                                className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
                                                            >
                                                                Confirm Delete
                                                            </button>
                                                            <button 
                                                                onClick={() => setConfirmingDeleteId(null)}
                                                                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-300 transition-all"
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
                                                            className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                                                        >
                                                            <UserMinus size={20} />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {/* Pending Actions */}
                                                    <button className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-xs hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                    <button className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-black text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                        <XCircle size={14} /> Deny
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Empty State */}
                    {(activeTab === 'active' ? activeUsers : pendingUsers).length === 0 && (
                        <div className="p-20 text-center">
                            <Users className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-bold">No users found in this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageUsers;
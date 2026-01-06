import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  UserMinus, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Users
} from 'lucide-react';

function ManageUsers({ onGoBack }) {
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'pending'

    // Mock Data - Connect this to your Supabase 'profiles' table later
    const [users, setUsers] = useState([
        { id: 1, name: "Philip O'Neill", email: "philip@dell.ie", role: "admin", status: "active" },
        { id: 2, name: "Sarah Smith", email: "sarah@company.com", role: "user", status: "active" },
        { id: 3, name: "James Bond", email: "007@mi6.gov", role: "user", status: "pending" },
    ]);

    const activeUsers = users.filter(u => u.status === 'active');
    const pendingUsers = users.filter(u => u.status === 'pending');

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

                    {/* Tab Switcher */}
                    <div className="flex bg-slate-200 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Active Staff ({activeUsers.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Requests ({pendingUsers.length})
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
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
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="block font-black text-slate-900 uppercase tracking-tight">{user.name}</span>
                                                <span className="text-sm text-slate-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-8 py-6 text-center">
                                        {user.role === 'admin' ? (
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
                                        <div className="flex justify-end gap-3">
                                            {activeTab === 'active' ? (
                                                <>
                                                    {/* Role Toggle Button */}
                                                    <button className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${user.role === 'admin' ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                                                        {user.role === 'admin' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                    </button>
                                                    
                                                    {/* Remove User */}
                                                    <button className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Remove User">
                                                        <UserMinus size={20} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Approval Actions */}
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
                </div>
            </div>
        </div>
    );
}

export default ManageUsers;
import React from 'react';
import { Mail, Lock, LogIn, ShieldCheck, UserPlus } from 'lucide-react';

// Using the same design language as your AdminPage TAB_CLASSES
const BUTTON_CLASSES = "flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 w-full mb-3";
const INPUT_CONTAINER = "relative mb-4 w-full";
const ICON_STYLE = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
const INPUT_STYLE = "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm";

function LoginPage({ email, setEmail, pass, setPass, loading, onSubmit, onSwitch, authError }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-50 rounded-full text-blue-600 mb-3">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Access Booking</h2>
                    <p className="text-gray-500 text-sm">Please enter your credentials</p>
                </div>

                <form onSubmit={onSubmit}>
                    {/* EMAIL */}
                    <label className="block text-sm font-semibold text-gray-600 mb-1 ml-1">Email Address</label>
                    <div className={INPUT_CONTAINER}>
                        <Mail size={18} className={ICON_STYLE} />
                        <input
                            type="email"
                            placeholder="you@school.edu"
                            className={INPUT_STYLE}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="flex justify-between items-center mb-1 ml-1">
                        <label className="text-sm font-semibold text-gray-600">Password</label>
                        <button type="button" className="text-xs text-blue-600 hover:underline">Forgot?</button>
                    </div>
                    <div className={INPUT_CONTAINER}>
                        <Lock size={18} className={ICON_STYLE} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={INPUT_STYLE}
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            required
                        />
                    </div>

                    {/* ERROR */}
                    {authError && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium">
                            {authError}
                        </div>
                    )}

                    {/* LOGIN BUTTON - Styled like your Admin Tabs */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 p-3 bg-blue-600 rounded-lg border border-blue-700 cursor-pointer font-bold text-white shadow-md transition-all hover:bg-blue-700 w-full mb-6 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>

                    {/* SWITCH TO SIGNUP */}
                    <div className="border-t border-gray-100 pt-6 text-center">
                        <button
                            type="button"
                            onClick={onSwitch}
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium inline-flex items-center gap-2"
                        >
                            <UserPlus size={16} />
                            New user? <span className="text-blue-600 font-bold">Create an account</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
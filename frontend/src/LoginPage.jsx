import React from 'react';
import { Mail, Lock, LogIn, ShieldCheck, UserPlus, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const INPUT_CONTAINER = "relative mb-1 w-full";
const ICON_STYLE = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
const INPUT_STYLE = `
  w-full pl-10 pr-4 py-3 bg-white border border-gray-200
  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
  outline-none transition-all shadow-sm placeholder:text-gray-400
  text-black caret-black
`;
import { Link } from 'react-router-dom';
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    const navigate = useNavigate();

    // 2. Handle the login logic LOCALLY
    const handleLogin = async (e) => {
        e.preventDefault(); // Stop the page from reloading (The Flicker)
        setLoading(true);
        setAuthError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setAuthError(error.message);
            setLoading(false);
        } else {
            // Success! The Router in App.js will detect the session change
            // and automatically redirect you to /MainScreen.
            // We don't need to do anything here.
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            {/* Desktop-optimized container: Wide layout */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row animate-in fade-in zoom-in duration-500">

                {/* LEFT SIDE: Visual/Brand Panel (Hidden on mobile) */}
                <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-between text-white">
                    <div>
                        <div className="inline-flex p-3 bg-white/10 rounded-xl mb-6 backdrop-blur-sm">
                            <ShieldCheck size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                            Welcome Back.
                        </h1>

                    </div>
                </div>

                {/* RIGHT SIDE: Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    {/* Header (Shows on mobile, modified for desktop) */}
                    <div className="text-center md:text-left mb-10">
                        <div className="inline-flex md:hidden p-3 bg-blue-50 rounded-full text-blue-600 mb-3">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Sign In</h2>
                        <p className="text-gray-500 mt-2 text-sm">Please enter your credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin()} className="space-y-5">
                        {/* EMAIL */}
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
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
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1 ml-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors">
                                    Forgot Password?
                                </button>
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
                        </div>

                        {/* ERROR MESSAGE */}
                        {authError && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-start gap-3 animate-shake">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                {authError}
                            </div>
                        )}

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                                loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                            }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>

                        {/* SWITCH TO SIGNUP */}
                        <div className="pt-8 border-t border-gray-50 text-center">
                            <div
                                type="button"
                                className="group text-sm text-gray-500 hover:text-blue-600 font-medium inline-flex items-center gap-2 transition-colors"
                            >
                                <UserPlus size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                <span>Don't have an account?</span>
                                <span className="text-blue-600 font-bold inline-flex items-center gap-1">
                                    Create one <Link to="/SignUp">Sign Up</Link>
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
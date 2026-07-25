import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Adjust path if necessary
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            setStatus({ type: 'error', message: error.message });
        } else {
            setStatus({ type: 'success', message: 'If an account exists, a recovery link has been sent.' });
        }
        setLoading(false);
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-sm text-gray-500 mt-2">Enter your email to receive a recovery link.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                        <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden px-3 py-2">
                            <Mail size={18} className="text-gray-400 mr-2" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="bg-transparent outline-none w-full text-sm text-black"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-3 rounded text-sm ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {status.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
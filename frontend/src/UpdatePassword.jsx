import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Adjust path if necessary
import { Lock } from 'lucide-react';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setStatus({ type: 'error', message: error.message });
            setLoading(false);
        } else {
            setStatus({ type: 'success', message: 'Password updated successfully! Redirecting...' });
            // Log out the temporary session and send to login
            setTimeout(async () => {
                await supabase.auth.signOut();
                navigate('/login');
            }, 2000);
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                    <p className="text-sm text-gray-500 mt-2">Please enter your new secure password below.</p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">New Password</label>
                        <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden px-3 py-2">
                            <Lock size={18} className="text-gray-400 mr-2" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="bg-transparent outline-none w-full text-sm text-black"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
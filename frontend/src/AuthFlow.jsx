import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Import your existing components
import MainScreen from './MainScreen';
import LoginPage from './LoginPage';
import SignUpPage from './SignUp'; // Your invite/signup page

function AuthFlow() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check for active session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // 2. Listen for changes (Login, Logout, Invite Link success)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Loading Screen (Crucial for Invite Links)
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
            <Routes>
                {/* ROOT PATH (/): 
                   If logged in -> MainScreen
                   If not -> LoginPage 
                */}
                <Route 
                    path="/" 
                    element={session ? <MainScreen /> : <Navigate to="/LoginPage" />} 
                />

                {/* LOGIN PATH: 
                   If logged in -> Redirect to MainScreen
                   If not -> Show Login Page
                */}
                <Route 
                    path="/LoginPage" 
                    element={!session ? <LoginPage /> : <Navigate to="/MainScreen" />} 
                />

                {/* SIGNUP PATH (For Invites): 
                   This must be accessible even if 'session' is null initially,
                   because the Invite Token is processed on this page.
                */}
                <Route 
                    path="/SignUp" 
                    element={<SignUpPage />} 
                />

                {/* MAIN APP PATH:
                   Protected. Only accessible if session exists.
                */}
                <Route 
                    path="/MainScreen" 
                    element={session ? <MainScreen /> : <Navigate to="/LoginPage" />} 
                />

                {/* Catch-all Redirect */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
    );
}

export default AuthFlow;
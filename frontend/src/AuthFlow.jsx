import React, { useState } from 'react';
import MainScreen from './MainScreen'; // Assuming FilterBar is the content after login
import LoginPage from './LoginPage'; // The visual form
import SignUpPage from './SignUp'; // You'll need this for signup
import { supabase } from './supabaseClient'; // Only import Supabase here

const signInUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Login Error:', error.message);
        throw new Error(error.message);
    }
    return data;
};

// Main Component that controls the flow
function AuthFlow() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true); // true for Login, false for SignUp
    const [authError, setAuthError] = useState(null);

    // Function to handle form submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError(null);

        try {
            await signInUser(email, pass);
            setIsLoggedIn(true);
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to switch between Login and Signup forms
    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setAuthError(null);
    };

    if (isLoggedIn) {
        return <MainScreen />; // The dashboard or main content
    }



    return (
        isLoginView ? (
            <LoginPage
                email={email}
                setEmail={setEmail}
                pass={pass}
                setPass={setPass}
                loading={loading}
                onSubmit={handleLoginSubmit}
                onSwitch={toggleView}
                authError={authError}
            />
        ) : (
            <SignUpPage onSwitch={toggleView} />
        )
    );
}

export default AuthFlow;
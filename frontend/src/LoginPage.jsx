import React from 'react';

const INPUT_CLASSES = "p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";

function LoginPage({ email, setEmail, pass, setPass, loading, onSubmit, onSwitch, authError }) {


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-xs p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center gap-2">
                    Access Booking
                </h2>

                <form onSubmit={onSubmit}>
                    {/* EMAIL FIELD */}
                    <div className="mb-4 flex flex-col items-center">
                        <label className="block text-gray-700 font-semibold mb-3" htmlFor="Email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="Email"
                            name="Email"
                            placeholder="you@school.edu"
                            required
                            className={INPUT_CLASSES + " w-full block"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className="mb-6 flex flex-col items-center">
                        <label className="block text-gray-700 font-semibold mb-3" htmlFor="Password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="Password"
                            name="Password"
                            placeholder="Enter your password"
                            required
                            className={INPUT_CLASSES + " w-full block"}
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                        />
                    </div>

                    {/* ERROR MESSAGE */}
                    {authError && (
                        <div className="mb-4 text-center text-sm text-red-600 font-medium">
                            {authError}
                        </div>
                    )}


                    {/* LOGIN BUTTON */}
                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-xl disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>

                    {/* Links */}
                    <div className="mt-4 text-center">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition duration-150">
                            Forgot Password?
                        </a>
                    </div>
                    <div className="mt-4 text-center">
                        <a
                            href="#" className="text-sm text-blue-600 hover:text-blue-800 transition duration-150"
                            onClick={(e) => {
                                e.preventDefault();
                                onSwitch(); // Function passed from parent to switch to Signup
                            }}
                        >
                            Sign Up!
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
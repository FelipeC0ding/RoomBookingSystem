import React from 'react';
import "tailwindcss";
const INPUT_CLASSES = "p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
function SignUp()
{

    const signUpPage[page, setPage] = useState("Login")

    const SetPage = () =>{
        switch(page){
            case 'Login':
            return <SignUp/>;
            case 'SignUp':
                return <Login/>;
        }
    return(
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">

                {/* Main Card Container: Narrowed (max-w-xs) and reduced padding (p-6) */}
                <div className="w-full max-w-xs p-6 bg-white rounded-xl shadow-2xl border border-gray-200">

                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center gap-2">
                        Access Booking
                    </h2>

                    <form>
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
                                className={INPUT_CLASSES + " w-1/2 mx-auto block"}
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
                                className={INPUT_CLASSES + " w-1/2 mx-auto block"}
                            />
                        </div>

                        {/* LOGIN BUTTON: WIDER AND BOLD (Matching the Filter Button Style) */}
                        <div className="flex justify-center mt-6">
                            <button
                                type="submit"
                                // Added w-full for width, py-3 for height, shadow-xl for depth
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-xl"
                            >
                                Log In
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition duration-150">
                                Forgot Password?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        );
}
export default SignUp;
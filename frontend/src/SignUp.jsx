import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserPlus, ArrowLeft, School, User, ShieldCheck } from 'lucide-react';
import FetchData from './DAL/FetchData';
import PopUp from './PopUps/popUpSignUp';
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {Link} from 'react-router-dom'
const INPUT_CONTAINER = "relative mb-1 w-full";
const ICON_STYLE = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
const INPUT_STYLE = `
  w-full pl-10 pr-4 py-3 bg-white border border-gray-200
  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
  outline-none transition-all shadow-sm placeholder:text-gray-400
  text-black caret-black
`;

function SignUp() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState('');

    const [Departments, setDepartments] = useState([]);
    const [Deptloading, setDeptLoading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [firstname, setFirstname] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popupConfig, setPopupConfig] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });
    const navigate = useNavigate()
    const isStrong = password.length >= 6 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

    useEffect(() => {
        const initPage = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            // If they already have a session, they are returning users
            if (session) {
                setEmail(session.user.email);
                return;
            }

            // NEW: Check if there is a token in the URL. 
            // If there is, DO NOT navigate to LoginPage. Let them stay and sign up.
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('token_hash')) {
                return; 
            }

            navigate('/LoginPage');
        };
        const setupUser = async (session) => {
            
            setEmail(session.user.email);
            try {
                const schoolData = await FetchData.GetSchools();
                setSchools(schoolData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
                // Don't navigate away! You want them to fill out the form here.
            }
        
        };
        initPage();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                if (session) {
                    await setupUser(session);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    useEffect(() => {
        async function getALlSchools() {
            try {
                setLoading(true);
                const data = await FetchData.GetSchools();
                console.log(data)
                setSchools(data);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        }
        getALlSchools();
    }, []);

    const getALlDepartments = async (organisationID) => {
        try {
            setDeptLoading(true);
            const data = await FetchData.GetDepartments(organisationID);
            setDepartments(data);
            setDeptLoading(false);
        } catch (error) {
            console.log('SignUp: ID = ', organisationID);
            setDeptLoading(false);
        }
    }

    const handleSignUp = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        // 1. Validations (Keep these as they are)
        if (password !== passwordConfirm) {
            setPopupConfig({ isOpen: true, type: 'error', title: 'Mismatch', message: 'Passwords must match.' });
            setIsSubmitting(false);
            return;
        }
        if (!isStrong) {
            setPopupConfig({ isOpen: true, type: 'error', title: 'Weak Password', message: 'Requirements not met.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const tokenHash = urlParams.get('token_hash') || urlParams.get('token');
            const emailFromUrl = urlParams.get('email');

            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'invite',
            });
            if (verifyError) throw new Error("Invite link invalid. Contact admin.");

            const orgID = await FetchData.GetOrganisationID(selectedSchool);
            const deptID = await FetchData.GetDepartmentID(selectedDepartment);

            const { data: authData, error: authError } = await supabase.auth.updateUser({
                password: password,
                data: {
                    organisation_id: orgID,
                    Firstname: firstname,
                    Surname: surname,
                }
            });
            if (authError) throw authError;

            await FetchData.AddUser(
                verifyData.user.id, 
                emailFromUrl, 
                firstname, 
                surname, 
                orgID, 
                deptID
            );

            setPopupConfig({
                isOpen: true,
                type: 'success',
                title: 'Account Created!',
                message: "Welcome to the system!"
            });

        } catch (error) {
            console.error("Signup error:", error);
            setPopupConfig({
                isOpen: true,
                type: 'error',
                title: 'Registration Failed',
                message: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100">

                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-blue-100 rounded-2xl text-blue-600 mb-4 shadow-inner">
                        <UserPlus size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="text-gray-500 mt-2">Enter your details to access the school booking system</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Personal Details</h3>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Firstname</label>
                                <div className={INPUT_CONTAINER}>
                                    <User size={18} className={ICON_STYLE} />
                                    <input type="text" placeholder="Jane" required className={INPUT_STYLE} onChange={(e) => setFirstname(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Surname</label>
                                <div className={INPUT_CONTAINER}>
                                    <User size={18} className={ICON_STYLE} />
                                    <input type="text" placeholder="Doe" required className={INPUT_STYLE} onChange={(e) => setSurname(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Work</h3>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">School</label>
                                <div className={INPUT_CONTAINER}>
                                    <School size={18} className={ICON_STYLE} />
                                    <select
                                        value={selectedSchool}
                                        onChange={(e) => { getALlDepartments(e.target.value); setSelectedSchool(e.target.value) }}
                                        className={INPUT_STYLE}
                                        disabled={loading}
                                        required
                                    >
                                        <option value="" disabled>{loading ? "Loading schools..." : "Select school"}</option>
                                        {schools.map((school) => (
                                            <option key={school.id} value={school.id}>{school.Name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Department</label>
                                <div className={INPUT_CONTAINER}>
                                    <School size={18} className={ICON_STYLE} />
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className={INPUT_STYLE}
                                        disabled={!selectedSchool || Deptloading}
                                        required
                                    >
                                        <option value="" disabled>{Deptloading ? "Loading..." : "Select department"}</option>
                                        {Departments.map((dept) => (
                                            <option key={dept.DepartmentID} value={dept.Name}>{dept.Name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                                    <div className={INPUT_CONTAINER}>
                                        <Lock size={18} className={ICON_STYLE} />
                                        <input type="password" placeholder="••••••••" required className={INPUT_STYLE} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                    <div className="mt-2">
                                        <div className="h-1 w-full bg-gray-200 rounded-full">
                                            <div
                                                className={`h-1 transition-all duration-300 rounded-full ${
                                                    isStrong ? 'w-full bg-green-500' : 'w-1/3 bg-red-400'
                                                }`}
                                            ></div>
                                        </div>
                                        <p className={`text-[10px] mt-1 font-medium ${isStrong ? 'text-green-600' : 'text-gray-400'}`}>
                                            {isStrong
                                                ? "✓ Password meets requirements"
                                                : "Requires: 6+ chars, 1 Capital, 1 Special character"}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Confirm</label>
                                    <div className={INPUT_CONTAINER}>
                                        <Lock size={18} className={ICON_STYLE} />
                                        <input type="password" placeholder="••••••••" required className={INPUT_STYLE} onChange={(e) => setPasswordConfirm(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 space-y-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
                                font-bold text-white transition-all duration-200
                                shadow-md hover:shadow-lg active:scale-[0.98]
                                ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                                }
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <PopUp
                isOpen={popupConfig.isOpen}
                type={popupConfig.type}
                title={popupConfig.title}
                message={popupConfig.message}
                onClose={() => {
                    setPopupConfig({ ...popupConfig, isOpen: false });
                    if (popupConfig.type === 'success') navigate('/MainScreen');
                }}
            />
        </div>
    );
}

export default SignUp;
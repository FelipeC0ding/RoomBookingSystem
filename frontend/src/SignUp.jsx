import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserPlus, ArrowLeft, School, User, ShieldCheck } from 'lucide-react';
import FetchData from './DAL/FetchData';
import PopUp from './PopUps/popUpSignUp';

const INPUT_CONTAINER = "relative mb-1 w-full";
const ICON_STYLE = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
const INPUT_STYLE = `
  w-full pl-10 pr-4 py-3 bg-white border border-gray-200
  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
  outline-none transition-all shadow-sm placeholder:text-gray-400
  text-black caret-black
`;

function SignUp({ onSwitch }) {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState('');

    const [Departments, setDepartments] = useState([]);
    const [Deptloading, setDeptLoading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [firstname, setFirstname] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('standard'); // Default role
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popupConfig, setPopupConfig] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const isStrong = password.length >= 6 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

    useEffect(() => {
        async function getALlSchools() {
            try {
                setLoading(true);
                const data = await FetchData.GetSchools();
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

        if (password !== passwordConfirm) {
            setPopupConfig({
                isOpen: true,
                type: 'error',
                title: 'Passwords Mismatch',
                message: 'Please make sure both passwords are identical.'
            });
            setIsSubmitting(false);
            return;
        }

        if(!isStrong){
            setPopupConfig({
                isOpen: true,
                type: 'error',
                title: 'Password is weak',
                message: 'Please make sure your password meets the requirements.'
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const orgID = await FetchData.GetOrganisationID(selectedSchool);
            const deptID = await FetchData.GetDepartmentID(selectedDepartment);

            // Pass the selected role to your API
            await FetchData.AddUser(email, password, firstname, surname, role, orgID, deptID);

            setPopupConfig({
                isOpen: true,
                type: 'success',
                title: 'Account Created!',
                message: "Check your inbox! We've sent a link to verify your email."
            });

        } catch (error) {
            if(parseInt(error.code) === 23505){
                setPopupConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Registration Failed',
                    message: "Email already in use. Contact your administrator."
                });
            } else {
                setPopupConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Registration Failed',
                    message: error.message || "Something went wrong."
                });
            }
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
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <div className={INPUT_CONTAINER}>
                                    <Mail size={18} className={ICON_STYLE} />
                                    <input type="email" placeholder="jane.doe@school.edu" autoComplete="off" required className={INPUT_STYLE} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Work</h3>
                            
                            {/* Role Selection Dropdown */}
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Account Role</label>
                                <div className={INPUT_CONTAINER}>
                                    <ShieldCheck size={18} className={ICON_STYLE} />
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className={INPUT_STYLE}
                                        required
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

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
                        <button
                            type="button"
                            onClick={onSwitch}
                            className="
                                w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                text-gray-500 font-semibold transition-all duration-200
                                hover:bg-gray-100 hover:text-gray-700 focus:outline-none
                            "
                        >
                            <ArrowLeft size={18} />
                            Already have an account? Log in
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
                    if (popupConfig.type === 'success') onSwitch();
                }}
            />
        </div>
    );
}

export default SignUp;
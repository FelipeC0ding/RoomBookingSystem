import React,{useState, useEffect} from 'react';
import { Mail, Lock, UserPlus, ArrowLeft, School } from 'lucide-react';
import FetchData from './DAL/FetchData'

const INPUT_CONTAINER = "relative mb-4 w-full";
const ICON_STYLE = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
const INPUT_STYLE = `
  w-full pl-10 pr-4 py-3 bg-white border border-gray-200
  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
  outline-none transition-all shadow-sm placeholder:text-gray-400
  text-black caret-black
`;


function SignUp({ onSwitch }) {
    const [schools, setSchools] = useState([]);
    const [organisationID, setOrganisationID] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState('')

    const [Departments, setDepartments] = useState([]);
    const [Deptloading, setDeptLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('')

     useEffect(() =>{
        async function getALlSchools(){
            try{

                setLoading(true)
                const data = await FetchData.GetSchools()
                setSchools(data)
                setLoading(false)

            }catch(Error){
                console.log(Error);

            }


        }
    getALlSchools()
    },[])


        const getALlDepartments = async (organisationID)=> {
            try{

                setDeptLoading(true)
                const data = await FetchData.GetDepartments(organisationID)
                setDepartments(data)
                setDeptLoading(false)

            }catch(Error){
                console.log('SignUp: ID = ', organisationID);

            }
        }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-300">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-50 rounded-full text-blue-600 mb-3">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                    <p className="text-gray-500 text-sm">Join the booking system today</p>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    {/* EMAIL FIELD */}
                    <div className="space-y-1 mb-4">
                        <label className="text-sm font-semibold text-gray-600 ml-1" htmlFor="Email">
                            Email Address
                        </label>
                        <div className={INPUT_CONTAINER}>
                            <Mail size={18} className={ICON_STYLE} />
                            <input
                                type="email"
                                id="Email"
                                placeholder="you@school.edu"
                                required
                                className={INPUT_STYLE}
                            />
                        </div>
                    </div>

                    <div className="space-y-1 mb-4">
                        <label className="text-sm font-semibold text-gray-600 ml-1" htmlFor="Email">
                            Firstname
                        </label>
                        <div className={INPUT_CONTAINER}>
                            <Mail size={18} className={ICON_STYLE} />
                            <input
                                type="Firstname"
                                id="Firstname"
                                placeholder="Firstname"
                                required
                                className={INPUT_STYLE}
                            />
                        </div>
                    </div>

                    <div className="space-y-1 mb-4">
                        <label className="text-sm font-semibold text-gray-600 ml-1" htmlFor="Email">
                            Surname
                        </label>
                        <div className={INPUT_CONTAINER}>
                            <Mail size={18} className={ICON_STYLE} />
                            <input
                                type="Surname"
                                id="Surname"
                                placeholder="Surname"
                                required
                                className={INPUT_STYLE}
                            />
                        </div>
                    </div>



                    {/* SCHOOL SELECT */}
                    <div className="space-y-1 mb-4">
                        <label className="text-sm font-semibold text-gray-600 ml-1" htmlFor="school-select">
                            Select Your School
                        </label>
                        <div className={INPUT_CONTAINER}>
                            <School size={18} className={ICON_STYLE} />

                            <select
                                value={selectedSchool}
                                onChange={(e) => {getALlDepartments(e.target.value); setSelectedSchool() }}
                                className={INPUT_STYLE}
                                disabled={loading}
                            >
                                <option value="" disabled className="text-black">
                                    {loading ? "Loading schools..." : "Select your school"}
                                </option>

                                {schools.map((school) => (
                                    <option
                                        key={school.id}
                                        value={school.id}
                                        className="text-black bg-white"
                                    >
                                        {school.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1 mb-4">
                        <label className="text-sm font-semibold text-gray-600 ml-1" htmlFor="school-select">
                            Select Your Department
                        </label>
                        <div className={INPUT_CONTAINER}>
                            <School size={18} className={ICON_STYLE} />

                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className={INPUT_STYLE}
                                disabled={Deptloading}
                            >
                                <option value="" disabled className="text-black">
                                    {loading ? "Loading Departments..." : "Select your Department"}
                                </option>

                                {Departments.map((department) => (
                                    <option
                                        key={department.DepartmentID}
                                        value={department.DepartmentID}
                                        className="text-black bg-white"
                                    >
                                        {department.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className="space-y-1 mb-4">
                        <label className="text-sm font-semibold text-gray-600 ml-1" htmlFor="Password">
                            Create Password
                        </label>
                        <div className={INPUT_CONTAINER}>
                            <Lock size={18} className={ICON_STYLE} />
                            <input
                                type="password"
                                id="Password"
                                placeholder="Min. 8 characters"
                                required
                                className={INPUT_STYLE}
                            />
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD FIELD */}
                    <div className="space-y-1 mb-6">
                        <label className="text-sm font-semibold text-gray-600 ml-1" htmlFor="ConfirmPassword">
                            Confirm Password
                        </label>
                        <div className={INPUT_CONTAINER}>
                            <Lock size={18} className={ICON_STYLE} />
                            <input
                                type="password"
                                id="ConfirmPassword"
                                placeholder="Repeat password"
                                required
                                className={INPUT_STYLE}
                            />
                        </div>
                    </div>

                    {/* SIGN UP BUTTON */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-lg active:scale-[0.98]"
                        onClick = {FetchData.AddUser()}
                    >
                        Create Account
                    </button>

                    {/* BACK TO LOGIN */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <button
                            type="button"
                            onClick={onSwitch}
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Already have an account? <span className="text-blue-600 font-bold">Log In</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
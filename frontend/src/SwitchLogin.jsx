import React, {useState} from 'react'
import LoginPage from './LoginPage.jsx'
import SignUp from './SignUp.jsx'

function SwitchComponent(){
    const [page, setPage] = useState("Login")

    const HandleSwitch = () =>{
        setPage(prevPage =>{
            if(prevPage === 'Login'){
                return 'SignUp'
                }
            else{
                return 'Login'
                }

            });
        }

    return(
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        {/*Condition ? Value_If_True : Value_If_False*/}
        {page === 'Login'?(
            <LoginPage onSwitch={HandleSwitch}/>
            ):(
                <SignUp onSwitch={HandleSwitch}/>
              )}
        </div>
    );
}
export default SwitchComponent
import React, {useState} from 'react'
import Login from './Login.jsx'
import SignUp from './SignUp.jsx'


function HandleSignIn(){
    const[email,setEmail] = useState('')
    const[pass, setPass] = useState('')
    const SignUserIn = async(e) =>{
        const { user, session, error } = await supabase.auth.signIn({
          email: email,
          password: pass,
        })

        if(error){
            console.log(error);
            }

    }
    return(
        <div>
            <h1>Sign In Component</h1>
            </div>

        );

}
export default HandleSignIn

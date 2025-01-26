import React from 'react'
import axios from 'axios'
import { useState } from "react";

export default function Register(props) {
    let {setClicked} = props;

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [confirmpwd, setConfimPwd] = useState("");
    let [error, setError] = useState("");

    async function handleCreateNewUser(event){
        event.preventDefault();
        let errorMessage = "";
        const emailRegex = /\w+@\w+.\w+/
        if(emailRegex.exec(email) && username.length < 15 && username.length !== 0 && pwd.length > 0 && pwd === confirmpwd && !email.includes(pwd)) {
            let user = {
                username: username,
                password: pwd,
                email: email
            }
            try {
                await axios.post("http://localhost:8000/registerUser", user);
                setClicked("LoginPage");
            } catch (error) {
                console.log(error.response.data.message);
                errorMessage = error.response.data.message;
            }

            
        } else {
            if(emailRegex.exec(email) === null) 
                errorMessage = "Email is invalid";
            if(pwd.includes(username) || pwd.includes(email.split("@")[0])) 
                errorMessage = "Password cannot contain your username or email!";
            if(username.length > 15) 
                errorMessage = "Username length must not exceed 15 characters";
            if(username.length === 0) 
                errorMessage = "Username cannot be empty";
            if(pwd.length === 0) 
                errorMessage = "Password cannot be empty";
            if(pwd !== confirmpwd) 
                errorMessage = "Passwords dont match";
        }
        if (errorMessage.length > 0) {
            setError(errorMessage);
        }
    }
    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleCreateNewUser(event);
        }
    }
    return (
        <div className='registerPage'>
        <form id="add-new-user" target="_blank" method="post">
            <button className = "return-to-welcomepage" onClick={() => setClicked("WelcomePage")}>Return to Welcome Page</button>
            <div id="new-user" className="error-messages-container">
                <span id="new-user-error-messages">{error}</span>
            </div>
            <h1>Username</h1>
            <span>Should not be more than 15 characters.</span><br />
            <input type="text" name="username" id="new-user-username" onKeyDown={handleKeyDown} onChange={(e) => setUsername(e.target.value)}/><br /><br />
            <h1>Email address</h1>
            <input type="text" name="email" id="new-user-email" onKeyDown={handleKeyDown} onChange={(e) => setEmail(e.target.value)}/><br /><br />
            <h1>Password</h1>
            <span>Should not contain username or email ID.</span><br />
            <input type="password" name="password" id="new-user-password" onKeyDown={handleKeyDown} onChange={(e) => setPwd(e.target.value)}/><br /><br />

            <h1>Confirm password</h1>
            <input type="password" name="password-confirm" id="new-user-password-confirm"  onKeyDown={handleKeyDown} onChange={(e) => setConfimPwd(e.target.value)}/><br /><br />

            <button className="new-user-submit" onClick={(event) => handleCreateNewUser(event)} value="Create user">Submit</button>
        </form>
        </div>

    )
}


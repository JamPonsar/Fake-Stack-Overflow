import React from 'react'
import axios from 'axios'
import { useState } from "react";

export default function Login(props) {
    let {setClicked, setIsLoggedIn} = props;

    const [email, setEmail] = useState(""); //email input state
    const [pwd, setPwd] = useState(""); //password input state
    const [error, setError] = useState("");
    
    async function handleLogin(event){
        let errorMessage = ""; //error message based on input given 
        const emailRegex = /\w+@\w+.\w+/ //regex for email format
        event.preventDefault();
        if(emailRegex.exec(email) && pwd.length > 0) {
            let login = {
                email: email,
                password: pwd
            }
            try {
                await axios.post("http://localhost:8000/login", login, { withCredentials: true });
                setIsLoggedIn(true);
                setClicked("HomePage");
            } catch (error) {
                console.log(error.response.data.message);
                errorMessage = error.response.data.message;
            }
        } else {
            if(emailRegex.exec(email) == null) errorMessage = "Email is invalid"; //not a valid email format
            if(pwd.length === 0) errorMessage = "Password cannot be blank"; 
        }
        if (errorMessage.length > 0) { //if error is given aka the login was unsuccessful because it doesnt match with db, setError to render page and print error 
            setError(errorMessage);
        }
    }


    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleLogin(event);
        }


    }
    return (
        <div className='loginPage'>
            <form id="login-Form" method="post">
            <button className = "return-to-welcomepage" onClick={() => setClicked("WelcomePage")}>Return to Welcome Page</button>
            <div className="login-Form-error-messages-container">
                <span id="login-Form-error-messages">{error}</span>
            </div>
            <h1>Email address</h1>
            <input
                type="text"
                className="form_input"
                autoComplete="off"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                onKeyDown={handleKeyDown}
            ></input>
            <br /><br />
            <h1>Password</h1>
            <input
                type="password"
                className="form_input"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
                onKeyDown={handleKeyDown}
            ></input>
            <br /><br />
            <button className="loginbutton" type="submit" id="submit" value="Login" onClick={(event) => handleLogin(event)}>Login</button>
            </form>
        </div>
    );
}
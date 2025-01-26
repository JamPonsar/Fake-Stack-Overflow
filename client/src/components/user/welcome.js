import axios from 'axios';
import React from 'react';

export default function WelcomePage(props) {
    let {setClicked, setIsLoggedIn} = props;
    async function handleGuestLogin() {

        try {
            await axios.post("http://localhost:8000/loginGuest", {}, { withCredentials: true });
        } catch (error) {
            console.log(error.response.data.message);
        }
        setIsLoggedIn(true);
    }
    return (
        <div className="welcome-page">
            <header>Welcome to Fake Stack Overflow!</header>
            <div className="welcome-buttons">
                <button className="register-btn" onClick={() => setClicked("RegisterPage")}>Register</button>
                <button className="login-btn" onClick={() => setClicked("LoginPage")}>Login</button>
                <button className="guest-btn" onClick={handleGuestLogin}>Continue as Guest</button>
            </div>
        </div>
    );
}

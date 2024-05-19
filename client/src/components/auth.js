
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "./userContext";
import "./auth.css";
import { Link, Navigate, Outlet } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const {setUsername: setLoggedUsername, setId, id} = useContext(UserContext);
    const [redirectPath, setRedirectPath] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const {data} = await axios.post("login", {username, password});
        setRedirect(true);
        setLoggedUsername(username);
        setId(data.id);
        setRedirectPath(data.id);
        setLoading(true);
    }

    if (id) {
        return <Navigate to={id}></Navigate>
    }

    if (redirect) {
        return <Navigate to={redirectPath}></Navigate>
    };

    return (
        <div className="container">
            <div className="left">
                <img id="logo" alt="logo" src="https://api.logo.com/api/v2/images?logo=logo_5db9ebed-67b6-4e88-ab54-0ce6340abb39&u=1715682275675&format=svg&margins=166&width=1000&height=750&fit=contain"></img>
            </div>
            <div className="form-container">
                <form className="authForm" onSubmit={handleSubmit}>
                    <div className="login-input-container">
                        <input
                        value={username}
                        onChange={event => setUsername(event.target.value)}
                        type="text"
                        placeholder="username"/>
                        <input
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        type="password"
                        placeholder="password"/>
                    </div>
                    <button className="submit-button">Login</button>
                    <div>
                        <div>
                            Already a member?
                            <Link to="/register" className="switch-button"> Register here!</Link>
                        </div>
                    </div>
                </form>
            </div>
            {loading ? <div className="loader-container"></div> : <div style="display:none"></div>}
        </div>
    )
}

export default Login


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

    async function handleSubmit(event) {
        event.preventDefault();
        const {data} = await axios.post("login", {username, password});
        setRedirect(true);
        setLoggedUsername(username);
        setId(data.id);
        setRedirectPath(data.id);
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
                <img id="logo" alt="logo" src="https://img.freepik.com/premium-vector/fast-message-icon-logo-design-template_412311-3778.jpg?w=2000"></img>
            </div>
            <div className="form-container">
                <form className="authForm" onSubmit={handleSubmit}>
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
                    <button className="submit-button">Login</button>
                    <div>
                        <div>
                            Already a member?
                            <Link to="/register" className="switch-button"> Register here!</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login

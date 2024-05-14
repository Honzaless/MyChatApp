import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./userContext";
import "./auth.css";
import { Link, Navigate } from "react-router-dom";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmpass, setConfirmpass] = useState("");
    const [redirect, setRedirect] = useState(false);
    const {setUsername: setLoggedUsername, setId, id} = useContext(UserContext);
    const [redirectPath, setRedirectPath] = useState("");

    async function handleSubmit(event) {
        if (password === confirmpass) {
            event.preventDefault();
            const {data} = await axios.post("register", {username, password, email});
            setRedirect(true);
            setLoggedUsername(username);
            setId(data.id);
            setRedirectPath(data.id);
        }
        else {
            event.preventDefault();
        }
    }

    if (id) {
        return <Navigate to={"../" + id}></Navigate>
    }

    if (redirect) {
        return <Navigate to={"../" + redirectPath}></Navigate>
    }

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
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    type="email"
                    placeholder="email"/>
                    <input
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    type="password"
                    placeholder="password"/>
                    <input
                    value={confirmpass}
                    onChange={event => setConfirmpass(event.target.value)}
                    type="password"
                    placeholder="confirm password"/>
                    <button className="submit-button">Register</button>
                    <div>
                        <div>
                            Already a member?
                            <Link to="/" className="switch-button"> Login here!</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register

import Login from "./auth";
import { useContext } from "react";
import { UserContext } from "./userContext";
import Chat from "./chat";
import { Route, Routes } from "react-router-dom";
import Register from "./register";
import Profile from "./profile";

export default function Routing() {
    const {username, id} = useContext(UserContext);
    return (
        <Routes>
            <Route index element={<Login key="auth" />} />
            <Route path="/register" element={<Register key="register" />} />
            <Route path="/:id" element={<Chat key={id} />} />
            <Route path="/profile/:id" element={<Profile />} />
        </Routes>
    )
}
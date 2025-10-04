import React, {useEffect, useState} from "react";
import './index.css';
import { FetchLogin } from "./api.ts";
import {validateToken} from "../../Utils/verifications.ts";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        FetchLogin(username, password);
        console.log("test")
    };

    useEffect(() => {
        const checkToken = async () => {
            const isValid = await validateToken();
            if (isValid) {
                window.location.href = "/";
            }
        };

        checkToken().then();
    }, []);

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                <a href={'/register'}>Don't have an account? Create one !</a>
            </form>
        </div>
    );
}

export { Login };
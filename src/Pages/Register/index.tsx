import React, {useEffect, useState} from 'react';
import './index.css';
import {validateToken} from "../../Utils/verifications.ts";
import {FetchRegister} from "./api.ts";

function Register(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        FetchRegister(name, email, password);
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
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
                <a href={'/login'}>Already have an account? Login !</a>
            </form>
        </div>
    );
};

export { Register };
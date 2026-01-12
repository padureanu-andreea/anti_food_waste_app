import React, { useState } from 'react';
import API from './api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token); // Salvăm token-ul pentru authMiddleware
            window.location.href = '/dashboard';
        } catch (err) {
            alert("Eroare la logare!");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Parolă" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Logare</button>
        </form>
    );
};

export default Login;
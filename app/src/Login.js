import React, { useState } from 'react';
import API from './api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        } catch (err) {
            alert("Eroare la logare! Verifică datele introduse.");
        }
    };

    return (
        <div className="container" style={{ maxWidth: '450px', marginTop: '50px' }}>
            <div className="card">
                <h2 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>Conectare</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Parolă" required onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" style={{ width: '100%', marginTop: '10px' }}>Intră în cont</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '', bio: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData); //
            alert("Cont creat! Acum te poți loga.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Eroare la înregistrare");
        }
    };

    return (
        <div className="container">
            <h2>Înregistrare</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} required />
                <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input type="password" placeholder="Parolă" onChange={e => setFormData({...formData, password: e.target.value})} required />
                <input placeholder="Telefon (ex: 0722123456)" onChange={e => setFormData({...formData, phone: e.target.value})} />
                <textarea placeholder="Bio (scurtă descriere)" onChange={e => setFormData({...formData, bio: e.target.value})} />
                <button type="submit">Creează Cont</button>
            </form>
        </div>
    );
};

export default Register;
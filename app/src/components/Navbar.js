import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', gap: '20px', padding: '15px', background: '#2c3e50', color: 'white' }}>
            <Link to="/" style={{ color: 'white', fontWeight: 'bold' }}>AntiWaste</Link>
            {user ? (
                <>
                    <Link to="/inventory" style={{ color: 'white' }}>Inventar</Link>
                    <Link to="/groups" style={{ color: 'white' }}>Grupuri</Link>
                    <Link to="/claims" style={{ color: 'white' }}>Cereri Primite</Link>
                    <Link to="/profile" style={{ color: 'white' }}>Profil</Link>
                    <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout ({user.username})</button>
                </>
            ) : (
                <>
                    <Link to="/login" style={{ color: 'white', marginLeft: 'auto' }}>Login</Link>
                    <Link to="/register" style={{ color: 'white' }}>Register</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;
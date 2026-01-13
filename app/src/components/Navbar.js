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
        <nav style={{ display: 'flex', gap: '20px', padding: '15px', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>🌱 AntiWaste</Link>
            <div style={{ flex: 1, display: 'flex', gap: '15px' }}>
                {user && (
                    <>
                        <Link to="/" style={{ color: 'white' }}>Dashboard</Link>
                        <Link to="/inventory" style={{ color: 'white' }}>Inventar</Link>
                        <Link to="/groups" style={{ color: 'white' }}>Grupuri</Link>
                        <Link to="/claims" style={{ color: 'white' }}>Cereri Primite</Link>
                    </>
                )}
            </div>
            <div>
                {user ? (
                    <button onClick={handleLogout} className="secondary" style={{ padding: '8px 15px' }}>
                        Logout ({user.username})
                    </button>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Login</Link>
                        <Link to="/register" style={{ color: 'white' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
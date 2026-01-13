import './App.css';
import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // Adăugat useNavigate aici
import { AuthProvider, AuthContext } from './context/AuthContext';
import API from './api';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './Login';
import Register from './pages/Register';
import Inventory from './pages/Inventory';
import Groups from './pages/Groups';
import Claims from './pages/Claims';
import Profile from './pages/Profile';
import Landing from './pages/Landing'; // Importăm pagina creată mai sus

const AlertSystem = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            // Verificăm sessionStorage pentru a apărea o singură dată (Pct 6)
            if (!user || sessionStorage.getItem('alertShown')) return;

            try {
                const { data } = await API.get('/inventory');
                const today = new Date();
                const inTwoDays = new Date();
                inTwoDays.setDate(today.getDate() + 2);

                const expiring = data.filter(i => 
                    new Date(i.expiryDate) <= inTwoDays && i.status === 'available'
                );

                if (expiring.length > 0) {
                    sessionStorage.setItem('alertShown', 'true');
                    window.alert(`Ai produse care expiră! Te redirecționăm către Inventar.`);
                    navigate('/inventory', { state: { highlightIds: expiring.map(i => i.id) } });
                }
            } catch (err) { console.error(err); }
        };
        check();
    }, [user, navigate]);

    return null;
};

function AppContent() {
    const { user } = useContext(AuthContext);

    return (
        <>
            <Navbar />
            <AlertSystem />
            <div className="container">
                <Routes>
                    {/* Dacă e logat vede Dashboard, altfel vede doar butoanele de Login/Register (Pct 3) */}
                    <Route path="/" element={user ? <Dashboard /> : <Landing />} />
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Rute protejate - redirecționează la login dacă nu ești logat */}
                    <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" />} />
                    <Route path="/groups" element={user ? <Groups /> : <Navigate to="/login" />} />
                    <Route path="/claims" element={user ? <Claims /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
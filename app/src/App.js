import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import API from './api';

// Importă paginile create anterior
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './Login';
import Register from './pages/Register';
import Inventory from './pages/Inventory';
import Groups from './pages/Groups';
import Claims from './pages/Claims';
import Profile from './pages/Profile';

// --- COMPONENTA DE ALERTE (SIMPLĂ) ---
const AlertSystem = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const checkExpirations = async () => {
            if (!user) return;

            try {
                // Preluăm produsele din inventarul utilizatorului
                const { data } = await API.get('/inventory');
                
                const today = new Date();
                const inTwoDays = new Date();
                inTwoDays.setDate(today.getDate() + 2);

                // Filtrăm produsele care expiră curând
                const expiringSoon = data.filter(item => {
                    const expiry = new Date(item.expiryDate);
                    return expiry <= inTwoDays && item.status === 'available';
                });

                if (expiringSoon.length > 0) {
                    const names = expiringSoon.map(i => i.name).join(", ");
                    // Afișăm alerta tip pop-up cerută
                    window.alert(`Atenție! Următoarele produse expiră curând (în mai puțin de 2 zile): ${names}. Consumă-le sau partajează-le!`);
                }
            } catch (err) {
                console.error("Eroare la verificarea alertelor", err);
            }
        };

        checkExpirations();
    }, [user]);

    return null; // Această componentă nu randează nimic vizual, doar execută logica
};

// --- STRUCTURA PRINCIPALĂ ---
function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <AlertSystem /> {/* Sistemul de alerte rulează global dacă ești logat */}
                <div style={{ padding: '20px' }}>
                    <Routes>
                        {/* Pagina principală (Feed-ul de produse de la prieteni) */}
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* Autentificare */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Managementul Inventarului (Frigiderul virtual) */}
                        <Route path="/inventory" element={<Inventory />} />
                        
                        {/* Managementul Grupurilor și Cerc Social */}
                        <Route path="/groups" element={<Groups />} />
                        
                        {/* Gestiunea cererilor de revendicare (Claim) */}
                        <Route path="/claims" element={<Claims />} />
                        
                        {/* Editare Profil (Bio, Telefon) */}
                        <Route path="/profile" element={<Profile />} />

                        {/* Redirecționare în caz de rută necunoscută */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
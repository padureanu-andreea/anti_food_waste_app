import React, { useState, useEffect } from 'react';
import API from '../api';

const Dashboard = () => {
    const [feed, setFeed] = useState([]);
    const [myClaims, setMyClaims] = useState([]); // Stat nou pentru cererile tale

    const fetchData = async () => {
        try {
            const resFeed = await API.get('/feed/products');
            setFeed(resFeed.data);

            const resClaims = await API.get('/claims?as=claimer');
            setMyClaims(resClaims.data);
        } catch (err) {
            console.error("Eroare la încărcarea datelor", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const claimItem = async (id) => {
        try {
            await API.post(`/inventory/${id}/claims`);
            alert("Revendicare trimisă!");
            fetchData(); // Reîmprospătăm datele
        } catch (err) {
            alert("Produsul nu mai este disponibil.");
        }
    };

    const shareOnSocial = async (id, platform) => {
        const { data } = await API.get(`/integrations/share/${platform}/${id}`);
        window.open(data.shareUrl || "#", "_blank");
    };

    return (
        <div className="container">
            {/* --- SECȚIUNEA 1: FEED PUBLIC --- */}
            <h2 style={{ color: 'var(--primary-green)' }}>🛒 Produse Disponibile în Grupuri</h2>
            <div className="grid">
                {feed.length === 0 && <p>Niciun produs nou de la prieteni.</p>}
                {feed.map(item => (
                    <div key={item.id} className="card">
                        <h3>{item.name}</h3>
                        <p><strong>Categorie:</strong> {item.category} | <strong>Cantitate:</strong> {item.quantity}</p>
                        <p><strong>De la:</strong> {item.User?.username}</p>
                        <p><strong>Expiră la:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => claimItem(item.id)}>Revendică</button>
                        </div>
                    </div>
                ))}
            </div>

            <hr style={{ margin: '40px 0', border: '0.5px solid #ccc' }} />

            {/* --- SECȚIUNEA 2: CERERILE MELE (Unde adăugăm codul cerut) --- */}
            <h2 style={{ color: 'var(--primary-green)' }}>📋 Revendicările Mele</h2>
            <div className="grid">
                {myClaims.length === 0 && <p>Nu ai revendicat niciun produs încă.</p>}
                {myClaims.map(claim => (
                    <div key={claim.id} className="card" style={{ backgroundColor: '#f0f4f0' }}>
                        <h3>{claim.Product?.name}</h3>
                        <p>Status cerere: <strong>{claim.status}</strong></p>
                        
                        {/* AICI AM ADĂUGAT CODUL SPECIFIC CERUT DE TINE */}
                        {claim.status === 'approved' && (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                                <p style={{ color: 'green', fontWeight: 'bold', margin: 0 }}>
                                    ✅ Aprobat! Pentru detalii despre ridicarea produsului, sunați la: {claim.Product?.User?.phone || 'Nespecificat'}
                                </p>
                            </div>
                        )}

                        {claim.status === 'pending' && (
                            <p style={{ color: 'orange' }}>⏳ Se așteaptă confirmarea donatorului...</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
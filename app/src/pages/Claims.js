import React, { useState, useEffect } from 'react';
import API from '../api';

const Claims = () => {
    const [claims, setClaims] = useState([]);

    const fetchClaims = async () => {
        const { data } = await API.get('/claims?as=owner');
        setClaims(data);
    };

    useEffect(() => { fetchClaims(); }, []);

    const updateStatus = async (claimId, status) => {
        await API.patch(`/claims/${claimId}`, { status });
        if (status === 'approved') {
            alert(`Revendicare aprobată!`);
        }
        fetchClaims();
    };

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)' }}>Cererile tale (Donator)</h2>
            <div className="grid">
                {claims.length === 0 && <p>Nu ai cereri noi momentan.</p>}
                {claims.map(c => (
                    <div key={c.id} className="card">
                        <p><strong>Produs:</strong> {c.Product?.name}</p>
                        <p><strong>Utilizator:</strong> {c.User?.username}</p>
                        <p><strong>Telefon:</strong> {c.User?.phone || 'Nespecificat'}</p>
                        <p><strong>Status:</strong> <span className="tag" style={{ background: c.status === 'pending' ? 'orange' : 'var(--primary-green)' }}>{c.status}</span></p>
                        
                        {c.status === 'pending' && (
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => updateStatus(c.id, 'approved')} style={{ flex: 1 }}>Acceptă</button>
                                <button onClick={() => updateStatus(c.id, 'rejected')} className="secondary" style={{ flex: 1 }}>Respinge</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Claims;
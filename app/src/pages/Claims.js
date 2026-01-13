import React, { useState, useEffect } from 'react';
import API from '../api';

const Claims = () => {
    const [claims, setClaims] = useState([]);

    const fetchClaims = async () => {
        const { data } = await API.get('/claims?as=owner'); //
        setClaims(data);
    };

    useEffect(() => { fetchClaims(); }, []);

    const updateStatus = async (claimId, status) => {
        const { data } = await API.patch(`/claims/${claimId}`, { status }); //
        if (status === 'approved') {
            alert(`Revendicare aprobată! Sună primitorul pentru detalii.`);
        }
        fetchClaims();
    };

    return (
        <div className="container">
            <h2>Cereri primite pentru produsele tale</h2>
            {claims.map(c => (
                <div key={c.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                    <p>Produs: <strong>{c.Product.name}</strong></p>
                    <p>Utilizator: {c.User.username} ({c.User.phone})</p>
                    <p>Status cerere: {c.status}</p>
                    {c.status === 'pending' && (
                        <>
                            <button onClick={() => updateStatus(c.id, 'approved')}>Acceptă</button>
                            <button onClick={() => updateStatus(c.id, 'rejected')}>Respinge</button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Claims;
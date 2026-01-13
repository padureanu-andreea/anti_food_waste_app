import React, { useState, useEffect } from 'react';
import API from '../api';

const CATEGORIES = ["Lactate", "Fructe", "Legume", "Carne", "Conserve", "Mancare gatita", "Diverse"];

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [sortBy, setSortBy] = useState('expiryDate'); // 'expiryDate' sau 'name'
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [shareSocial, setShareSocial] = useState(false);

    const loadData = async () => {
        const resInv = await API.get('/inventory');
        const resGroups = await API.get('/groups');
        setItems(resInv.data);
        setMyGroups(resGroups.data.flatMap(g => g.groups));
    };

    useEffect(() => { loadData(); }, []);

    // --- SORTARE ---
    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === 'expiryDate') return new Date(a.expiryDate) - new Date(b.expiryDate);
        return a.name.localeCompare(b.name);
    });

    // --- ȘTERGERE CU STATISTICI ---
    const handleDelete = async (id) => {
        const status = window.confirm("Apasă OK dacă produsul a fost CONSUMAT sau CANCEL dacă a fost ARUNCAT.") 
            ? 'consumed' : 'trashed';
        
        try {
            await API.patch(`/inventory/${id}`, { status }); // Actualizăm statusul pentru statistici
            await API.delete(`/inventory/${id}`); // Ștergem
            loadData();
        } catch (err) { alert("Eroare la ștergere"); }
    };

    const handleShare = async (productId) => {
        if (selectedGroups.length === 0) return alert("Selectează cel puțin un grup!");
        await API.post(`/products/${productId}/share`, { groupIds: selectedGroups });
        
        if (shareSocial) {
            window.open(`http://localhost:3000/integrations/share/facebook/${productId}`, "_blank");
        }
        alert("Produs partajat!");
        loadData();
    };

    return (
        <div className="container">
            <h2>Frigiderul Meu Virtual</h2>
            
            <div className="controls">
                <label>Sortează după: </label>
                <select onChange={(e) => setSortBy(e.target.value)}>
                    <option value="expiryDate">Data Expirării</option>
                    <option value="name">Nume (A-Z)</option>
                </select>
            </div>

            {CATEGORIES.map(cat => {
                const catItems = sortedItems.filter(i => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                    <div key={cat} className="category-section">
                        <h3>{cat}</h3>
                        <div className="grid">
                            {catItems.map(item => (
                                <div key={item.id} className="card" style={{ borderLeft: `5px solid ${new Date(item.expiryDate) < new Date() ? 'red' : 'green'}` }}>
                                    <h4>{item.name} ({item.quantity})</h4>
                                    <p>Expiră: {item.expiryDate}</p>
                                    <p>Status: <strong>{item.status}</strong></p>
                                    
                                    <div className="actions">
                                        <button onClick={() => handleDelete(item.id)}>Șterge</button>
                                        
                                        {item.status === 'available' && (
                                            <div className="share-box">
                                                <select multiple onChange={e => setSelectedGroups(Array.from(e.target.selectedOptions, o => o.value))}>
                                                    {myGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                </select>
                                                <label>
                                                    <input type="checkbox" onChange={e => setShareSocial(e.target.checked)} /> Postez pe Social Media
                                                </label>
                                                <button onClick={() => handleShare(item.id)}>Partajează</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Inventory;
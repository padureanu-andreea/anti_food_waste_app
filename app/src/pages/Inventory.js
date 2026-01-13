import React, { useState, useEffect } from 'react';
import API from '../api';

const CATEGORIES = ["Lactate", "Fructe", "Legume", "Carne", "Conserve", "Mancare gatita", "Diverse"];

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [sortBy, setSortBy] = useState('expiryDate');
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: 'Diverse', quantity: '', notes: '' });
    const [selectedGroups, setSelectedGroups] = useState([]);

    const loadData = async () => {
        const resInv = await API.get('/inventory');
        const resGroups = await API.get('/groups');
        setItems(resInv.data);
        setMyGroups(resGroups.data.flatMap(g => g.groups));
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await API.post('/inventory', newItem);
        setShowForm(false);
        loadData();
    };

    const handleDelete = async (id) => {
        const status = window.confirm("Apasă OK dacă a fost CONSUMAT sau CANCEL dacă a fost ARUNCAT.") ? 'consumed' : 'trashed';
        await API.patch(`/inventory/${id}`, { status });
        await API.delete(`/inventory/${id}`);
        loadData();
    };

    const handleShare = async (productId) => {
        if (selectedGroups.length === 0) return alert("Selectează un grup!");
        await API.post(`/products/${productId}/share`, { groupIds: selectedGroups });
        alert("Produs partajat cu succes!");
        loadData();
    };

    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === 'expiryDate') return new Date(a.expiryDate) - new Date(b.expiryDate);
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>🌿 Cămara Mea Eco</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Închide Formularul" : "+ Adaugă Aliment Nou"}
                </button>
            </div>

            {showForm && (
                <div className="card">
                    <h3>Detalii Produs</h3>
                    <form onSubmit={handleSubmit}>
                        <input placeholder="Nume (ex: Iaurt)" required onChange={e => setNewItem({...newItem, name: e.target.value})} />
                        <input type="date" required onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} />
                        <select onChange={e => setNewItem({...newItem, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input placeholder="Cantitate (ex: 200g, 1 buc)" required onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
                        <button type="submit" style={{ width: '100%' }}>Salvează în Frigider</button>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: '30px' }}>
                <label>Sortează după: </label>
                <select style={{ width: 'auto', marginLeft: '10px' }} onChange={(e) => setSortBy(e.target.value)}>
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
                                <div key={item.id} className="card">
                                    <h4>{item.name}</h4>
                                    <p><strong>Cantitate:</strong> {item.quantity}</p>
                                    <p><strong>Expiră la:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> <span style={{color: item.status === 'available' ? 'green' : 'gray'}}>{item.status}</span></p>
                                    
                                    {item.status === 'available' && (
                                        <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                            <p style={{ fontSize: '0.8rem' }}>Partajează cu grupul:</p>
                                            <select multiple style={{ height: '60px' }} onChange={e => setSelectedGroups(Array.from(e.target.selectedOptions, o => o.value))}>
                                                {myGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                            <button onClick={() => handleShare(item.id)} style={{ fontSize: '0.7rem', width: '100%' }}>Trimite la Prieteni</button>
                                        </div>
                                    )}
                                    <button className="secondary" onClick={() => handleDelete(item.id)} style={{ width: '100%', marginTop: '10px' }}>Șterge / Consumat</button>
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
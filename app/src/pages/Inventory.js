import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import API from '../api';

const CATEGORIES = ["Lactate", "Fructe", "Legume", "Carne", "Conserve", "Mancare gatita", "Diverse"];

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [sortBy, setSortBy] = useState('expiryDate');
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: 'Diverse', quantity: '', notes: '' });
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, itemId: null });
    
    const location = useLocation();
    const highlightIds = location.state?.highlightIds || [];

    const loadData = async () => {
        try {
            const resInv = await API.get('/inventory');
            const resGroups = await API.get('/groups');
            setItems(resInv.data);
            const allGroups = resGroups.data.flatMap(g => g.groups);
            setMyGroups(allGroups);
        } catch (err) {
            console.error("Eroare la încărcarea datelor", err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/inventory', newItem);
            setShowForm(false);
            loadData();
            window.customAlert("Produs adăugat cu succes!");
        } catch (err) { window.customAlert("Eroare la salvarea produsului."); }
    };

    const confirmDelete = async (status) => {
        try {
            // Soft Delete: actualizăm statusul fără a șterge rândul
            await API.patch(`/inventory/${deleteModal.itemId}`, { status });
            setDeleteModal({ show: false, itemId: null });
            loadData(); 
            window.customAlert(status === 'consumed' ? "Să îți fie de bine! 🌿" : "Produs marcat ca irosit.");
        } catch (err) {
            window.customAlert("Eroare la procesarea cererii.");
        }
    };

    const handleShare = async (productId) => {
        if (selectedGroups.length === 0) return window.customAlert("Selectează cel puțin un grup!");
        try {
            await API.post(`/products/${productId}/share`, { groupIds: selectedGroups });
            window.customAlert("Produs partajat cu succes!");
            loadData(); 
        } catch (err) { window.customAlert("Eroare la partajare."); }
    };

    const shareOnSocial = async (id, platform) => {
        try {
            const { data } = await API.get(`/integrations/share/${platform}/${id}`);
            
            if (data && data.shareUrl) {
                // FIX Instagram: Copiem textul automat în clipboard
                if (platform === 'instagram' && data.generatedMessage) {
                    await navigator.clipboard.writeText(data.generatedMessage);
                    window.customAlert("Mesajul a fost copiat! Te redirecționăm la Instagram pentru a-l lipi în postare.");
                }
                
                // Redirecționare către platformă (Fix tab-ul aplicației proprii)
                window.open(data.shareUrl, "_blank");
            } else {
                window.customAlert("Eroare: Link-ul de share nu a putut fi generat.");
            }
        } catch (err) {
            window.customAlert("Eroare la comunicarea cu serverul.");
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.patch(`/inventory/${editItem.id}`, editItem);
            window.customAlert("Produs actualizat cu succes!");
            setEditItem(null); 
            loadData(); 
        } catch (err) {
            window.customAlert("Eroare la actualizarea produsului.");
        }
    };

    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === 'expiryDate') return new Date(a.expiryDate) - new Date(b.expiryDate);
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>Inventarul meu</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Închide Formularul" : "+ Adaugă Aliment Nou"}
                </button>
            </div>

            {showForm && (
                <div className="card">
                    <h3>Detalii Produs Nou</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Nume produs:</label>
                        <input placeholder="ex: Iaurt" required onChange={e => setNewItem({...newItem, name: e.target.value})} />
                        <label>Data expirării:</label>
                        <input type="date" required onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} />
                        <label>Categorie:</label>
                        <select onChange={e => setNewItem({...newItem, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <label>Cantitate:</label>
                        <input placeholder="ex: 200g, 1 buc" required onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
                        <button type="submit" style={{ width: '100%' }}>Salvează în Inventar</button>
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
                                <div key={item.id} className="card" style={{ 
                                    position: 'relative',
                                    border: highlightIds.includes(item.id) ? '2px solid var(--danger)' : '1px solid #e0e0e0',
                                    backgroundColor: highlightIds.includes(item.id) ? '#fff5f5' : 'white'
                                }}>
                                    {/* Buton Editare Pencil */}
                                    <button 
                                        onClick={() => setEditItem(item)} 
                                        style={{ 
                                            position: 'absolute', top: '10px', right: '10px', 
                                            padding: '5px', background: 'none', color: 'var(--primary-green)',
                                            fontSize: '1.2rem', minWidth: 'auto', border: 'none', cursor: 'pointer'
                                        }}
                                        title="Editează produs"
                                    >
                                        ✏️
                                    </button>

                                    <h4>{item.name} {highlightIds.includes(item.id) && <span style={{color: 'red', fontSize: '0.8rem'}}> (Expiră curând!)</span>}</h4>
                                    <p><strong>Cantitate:</strong> {item.quantity}</p>
                                    <p><strong>Expiră la:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> <span style={{color: item.status === 'available' ? 'green' : 'gray'}}>{item.status}</span></p>
                                    
                                    {item.status === 'available' && (
                                        <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Partajează cu grupul:</p>
                                            
                                            <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px' }}>
                                                {myGroups.map(g => (
                                                    <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            style={{ width: 'auto' }}
                                                            checked={selectedGroups.includes(g.id.toString())}
                                                            onChange={(e) => {
                                                                const id = g.id.toString();
                                                                if (e.target.checked) setSelectedGroups([...selectedGroups, id]);
                                                                else setSelectedGroups(selectedGroups.filter(x => x !== id));
                                                            }}
                                                        /> {g.name}
                                                    </label>
                                                ))}
                                            </div>
                                            <button onClick={() => handleShare(item.id)} style={{ fontSize: '0.8rem', width: '100%', marginBottom: '10px' }}>Trimite la Prieteni</button>
                                            
                                            {/* --- SECȚIUNE SOCIAL SHARE CU LOGOURI --- */}
                                            {item.ProductVisibilities?.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px', marginBottom: '10px' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Share:</span>
                                                    
                                                    {/* Facebook Logo Button */}
                                                    <button 
                                                        onClick={() => shareOnSocial(item.id, 'facebook')} 
                                                        style={{ background: 'none', border: 'none', color: '#1877F2', fontSize: '1.8rem', cursor: 'pointer', padding: '0', minWidth: 'auto' }}
                                                        title="Share pe Facebook"
                                                    >
                                                        <i className="fab fa-facebook"></i>
                                                    </button>

                                                    {/* Instagram Logo Button */}
                                                    <button 
                                                        onClick={() => shareOnSocial(item.id, 'instagram')} 
                                                        style={{ background: 'none', border: 'none', color: '#E4405F', fontSize: '1.8rem', cursor: 'pointer', padding: '0', minWidth: 'auto' }}
                                                        title="Share pe Instagram"
                                                    >
                                                        <i className="fab fa-instagram"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button className="secondary" onClick={() => setDeleteModal({ show: true, itemId: item.id })} style={{ width: '100%', marginTop: '5px' }}>Șterge / Consumat</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Modal de Editare */}
            {editItem && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{ maxWidth: '500px' }}>
                        <h3 style={{ color: 'var(--primary-green)' }}>Editează Produs</h3>
                        <form onSubmit={handleUpdateSubmit}>
                            <label>Nume produs:</label>
                            <input value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} required />
                            <label>Data expirării:</label>
                            <input type="date" value={editItem.expiryDate} onChange={e => setEditItem({...editItem, expiryDate: e.target.value})} required />
                            <label>Categorie:</label>
                            <select value={editItem.category} onChange={e => setEditItem({...editItem, category: e.target.value})}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <label>Cantitate:</label>
                            <input value={editItem.quantity} onChange={e => setEditItem({...editItem, quantity: e.target.value})} required />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="submit" style={{ flex: 1 }}>Salvează</button>
                                <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditItem(null)}>Anulează</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Consum / Ștergere */}
            {deleteModal.show && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <h3 style={{ color: 'var(--primary-green)' }}>Ce s-a întâmplat cu produsul?</h3>
                        <p>Alege o opțiune pentru a actualiza statisticile tale eco.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => confirmDelete('consumed')}>✅ L-am CONSUMAT</button>
                            <button className="secondary" onClick={() => confirmDelete('trashed')}>🗑️ L-am ARUNCAT</button>
                            <button style={{ background: 'none', color: 'gray', marginTop: '10px' }} onClick={() => setDeleteModal({ show: false })}>Anulează</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
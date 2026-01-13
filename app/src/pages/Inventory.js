// import React, { useState, useEffect } from 'react';
// import API from '../api';

// const CATEGORIES = ["Lactate", "Fructe", "Legume", "Carne", "Conserve", "Mancare gatita", "Diverse"];

// const Inventory = () => {
//     const [items, setItems] = useState([]);
//     const [myGroups, setMyGroups] = useState([]);
//     const [sortBy, setSortBy] = useState('expiryDate');
//     const [showForm, setShowForm] = useState(false);
//     const [newItem, setNewItem] = useState({ name: '', expiryDate: '', category: 'Diverse', quantity: '', notes: '' });
//     const [selectedGroups, setSelectedGroups] = useState([]);

//     const loadData = async () => {
//         const resInv = await API.get('/inventory');
//         const resGroups = await API.get('/groups');
//         setItems(resInv.data);
//         setMyGroups(resGroups.data.flatMap(g => g.groups));
//     };

//     useEffect(() => { loadData(); }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         await API.post('/inventory', newItem);
//         setShowForm(false);
//         loadData();
//     };

//     const handleDelete = async (id) => {
//         const status = window.confirm("Apasă OK dacă a fost CONSUMAT sau CANCEL dacă a fost ARUNCAT.") ? 'consumed' : 'trashed';
//         await API.patch(`/inventory/${id}`, { status });
//         await API.delete(`/inventory/${id}`);
//         loadData();
//     };

//     const handleShare = async (productId) => {
//         if (selectedGroups.length === 0) return alert("Selectează un grup!");
//         await API.post(`/products/${productId}/share`, { groupIds: selectedGroups });
//         alert("Produs partajat cu succes!");
//         loadData();
//     };

//     const sortedItems = [...items].sort((a, b) => {
//         if (sortBy === 'expiryDate') return new Date(a.expiryDate) - new Date(b.expiryDate);
//         return a.name.localeCompare(b.name);
//     });

//     return (
//     <div className="container">
//         {/* Punctul 1: Am scos "Eco" din titlu */}
//         <h2 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>Inventarul meu</h2>
        
//         <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//             <button onClick={() => setShowForm(!showForm)}>
//                 {showForm ? "Închide Formularul" : "+ Adaugă Aliment Nou"}
//             </button>
//         </div>

//         {/* Punctul 12: Adăugare Label-uri pentru câmpurile formularului */}
//         {showForm && (
//             <div className="card">
//                 <h3>Detalii Produs</h3>
//                 <form onSubmit={handleSubmit}>
//                     <label>Nume produs:</label>
//                     <input placeholder="ex: Iaurt" required onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    
//                     <label>Data expirării:</label>
//                     <input type="date" required onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} />
                    
//                     <label>Categorie:</label>
//                     <select onChange={e => setNewItem({...newItem, category: e.target.value})}>
//                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
//                     </select>
                    
//                     <label>Cantitate:</label>
//                     <input placeholder="ex: 200g, 1 buc" required onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
                    
//                     <button type="submit" style={{ width: '100%' }}>Salvează în Frigider</button>
//                 </form>
//             </div>
//         )}

//         <div className="card" style={{ marginBottom: '30px' }}>
//             <label>Sortează după: </label>
//             <select style={{ width: 'auto', marginLeft: '10px' }} onChange={(e) => setSortBy(e.target.value)}>
//                 <option value="expiryDate">Data Expirării</option>
//                 <option value="name">Nume (A-Z)</option>
//             </select>
//         </div>

//         {CATEGORIES.map(cat => {
//             const catItems = sortedItems.filter(i => i.category === cat);
//             if (catItems.length === 0) return null;
//             return (
//                 <div key={cat} className="category-section">
//                     <h3>{cat}</h3>
//                     <div className="grid">
//                         {catItems.map(item => (
//                             <div key={item.id} className="card" style={{ 
//                                 /* Punctul 6: Evidențiere roșie pentru produsele care expiră curând */
//                                 border: highlightIds.includes(item.id) ? '2px solid var(--danger)' : '1px solid #e0e0e0',
//                                 backgroundColor: highlightIds.includes(item.id) ? '#fff5f5' : 'white'
//                             }}>
//                                 <h4>{item.name} {highlightIds.includes(item.id) && <span style={{color: 'red', fontSize: '0.8rem'}}> (Expiră curând!)</span>}</h4>
//                                 <p><strong>Cantitate:</strong> {item.quantity}</p>
//                                 <p><strong>Expiră la:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
//                                 <p><strong>Status:</strong> <span style={{color: item.status === 'available' ? 'green' : 'gray'}}>{item.status}</span></p>
                                
//                                 {item.status === 'available' && (
//                                     <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
//                                         <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Partajează cu grupul:</p>
                                        
//                                         {/* Punctul 11: Înlocuire Select Multiple cu Checkbox-uri */}
//                                         <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px' }}>
//                                             {myGroups.map(g => (
//                                                 <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
//                                                     <input 
//                                                         type="checkbox" 
//                                                         style={{ width: 'auto' }}
//                                                         checked={selectedGroups.includes(g.id.toString())}
//                                                         onChange={(e) => {
//                                                             const id = g.id.toString();
//                                                             if (e.target.checked) setSelectedGroups([...selectedGroups, id]);
//                                                             else setSelectedGroups(selectedGroups.filter(x => x !== id));
//                                                         }}
//                                                     /> {g.name}
//                                                 </label>
//                                             ))}
//                                         </div>
//                                         <button onClick={() => handleShare(item.id)} style={{ fontSize: '0.7rem', width: '100%' }}>Trimite la Prieteni</button>
                                        
//                                         {/* Punctul 7: Butoane Social Share (vizibile doar după ce produsul este partajat într-un grup) */}
//                                         <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
//                                             <button onClick={() => shareOnSocial(item.id, 'facebook')} className="secondary" style={{ flex: 1, fontSize: '0.7rem' }}>
//                                                 Share: 🔵 FB
//                                             </button>
//                                             <button onClick={() => shareOnSocial(item.id, 'instagram')} className="secondary" style={{ flex: 1, fontSize: '0.7rem' }}>
//                                                 Share: 📸 IG
//                                             </button>
//                                         </div>
//                                     </div>
//                                 )}
//                                 {/* Punctul 4: Butonul apelează handleDelete care face PATCH (status) și DELETE */}
//                                 <button className="secondary" onClick={() => handleDelete(item.id)} style={{ width: '100%', marginTop: '10px' }}>Șterge / Consumat</button>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             );
//         })}
//     </div>
// );
// };
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
        } catch (err) { alert("Eroare la salvarea produsului."); }
    };

    const handleDelete = async (id) => {
        const isConsumed = window.confirm("Apasă OK dacă a fost CONSUMAT sau CANCEL dacă a fost ARUNCAT.");
        const newStatus = isConsumed ? 'consumed' : 'trashed';
        try {
            await API.patch(`/inventory/${id}`, { status: newStatus }); // Punctul 4
            await API.delete(`/inventory/${id}`);
            loadData();
        } catch (err) { alert("Eroare la procesare."); }
    };

    const handleShare = async (productId) => {
        if (selectedGroups.length === 0) return alert("Selectează cel puțin un grup!");
        try {
            await API.post(`/products/${productId}/share`, { groupIds: selectedGroups });
            alert("Produs partajat cu succes!");
            loadData(); // Reîncărcăm pentru a vedea butoanele de social media
        } catch (err) { alert("Eroare la partajare."); }
    };

    const shareOnSocial = async (id, platform) => {
        try {
            const { data } = await API.get(`/integrations/share/${platform}/${id}`);
            window.open(data.shareUrl || "#", "_blank");
        } catch (err) { alert("Eroare la generarea link-ului."); }
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
                    <h3>Detalii Produs</h3>
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
                                    border: highlightIds.includes(item.id) ? '2px solid var(--danger)' : '1px solid #e0e0e0',
                                    backgroundColor: highlightIds.includes(item.id) ? '#fff5f5' : 'white'
                                }}>
                                    <h4>{item.name} {highlightIds.includes(item.id) && <span style={{color: 'red', fontSize: '0.8rem'}}> (Expiră curând!)</span>}</h4>
                                    <p><strong>Cantitate:</strong> {item.quantity}</p>
                                    <p><strong>Expiră la:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> <span style={{color: item.status === 'available' ? 'green' : 'gray'}}>{item.status}</span></p>
                                    
                                    {item.status === 'available' && (
                                        <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Partajează cu grupul:</p>
                                            
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
                                            <button onClick={() => handleShare(item.id)} style={{ fontSize: '0.7rem', width: '100%' }}>Trimite la Prieteni</button>
                                            
                                            {/* AICI ESTE SNIPPET-UL TĂU CU LOGICA CERUTĂ (Punctul 7) */}
                                            {item.status === 'available' && item.ProductVisibilities?.length > 0 && (
                                                <div className="social-share" style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                                    <button onClick={() => shareOnSocial(item.id, 'facebook')} className="secondary" style={{ flex: 1, fontSize: '0.7rem' }}>
                                                        Share: FB
                                                    </button>
                                                    <button onClick={() => shareOnSocial(item.id, 'instagram')} className="secondary" style={{ flex: 1, fontSize: '0.7rem' }}>
                                                        Share: IG
                                                    </button>
                                                </div>
                                            )}
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
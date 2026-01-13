import React, { useState, useEffect } from 'react';
import API from '../api';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [newGroupName, setNewGroupName] = useState('');

    const fetchGroups = async () => {
        try {
            const { data } = await API.get('/groups');
            setGroups(data);
        } catch (err) {
            console.error("Eroare la încărcarea grupurilor", err);
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    const createGroup = async (e) => {
        e.preventDefault();
        await API.post('/groups', { name: newGroupName });
        setNewGroupName('');
        fetchGroups();
    };

    const addMember = async (groupId) => {
        try {
            const userRes = await API.get(`/auth/users/${searchUser}`);
            const userId = userRes.data.id;
            await API.post(`/groups/${groupId}/members`, { userId: userId });
            alert("Membru adăugat!");
            setSearchUser('');
            fetchGroups();
        } catch (err) { 
            alert("Utilizatorul nu a fost găsit sau este deja în grup."); 
        }
    };

    const addTag = async (groupId, memberId) => {
        const tagName = window.prompt("Introdu eticheta (ex: Vegetarian, Vegan, Carnivor):");
        if (!tagName) return;

        try {
            let tagId;
            try {
                // Pas 1: Încercăm să creăm tag-ul
                const tagRes = await API.post('/tags', { name: tagName });
                tagId = tagRes.data.id;
            } catch (err) {
                // Dacă tag-ul există deja (409), backend-ul tău îl trimite înapoi în obiectul 'tag'
                if (err.response && err.response.status === 409) {
                    tagId = err.response.data.tag.id;
                } else { throw err; }
            }

            // Pas 2: Legăm tag-ul de membrul grupului
            if (tagId) {
                await API.post(`/groups/${groupId}/members/${memberId}/tags`, { tagId });
                alert("Etichetă adăugată!");
                fetchGroups();
            }
        } catch (err) {
            alert("Eroare la adăugarea etichetei.");
        }
    };

    return (
        <div className="container">
            {/* Punctul 1: Titlu fără "Eco" */}
            <h2 style={{ color: 'var(--primary-green)' }}>Management Grupuri</h2>
            
            <div className="card">
                <h3>Creează un grup nou</h3>
                <form onSubmit={createGroup} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        placeholder="Numele grupului (ex: Familie, Vecini)" 
                        value={newGroupName} 
                        onChange={e => setNewGroupName(e.target.value)} 
                        required 
                    />
                    <button type="submit">Creează</button>
                </form>
            </div>

            {groups.map(section => (
                <div key={section.status} style={{ marginTop: '30px' }}>
                    <h3 style={{ textTransform: 'capitalize' }}>Grupuri în care ești {section.status === 'owner' ? 'Proprietar' : 'Membru'}</h3>
                    <div className="grid">
                        {section.groups.map(g => (
                            <div key={g.id} className="group-card">
                                <h4>{g.name}</h4>
                                <div style={{ margin: '10px 0' }}>
                                    <strong>Membri:</strong>
                                    
                                    {/* Punctul 5: Snippet-ul cerut pentru afișarea membrilor și etichetelor */}
                                    {g.members && g.members.length > 0 ? (
                                        g.members.map(m => (
                                            <div key={m.id} className="member-item" style={{ fontSize: '0.9rem', marginTop: '8px', padding: '5px', borderBottom: '1px solid #f0f0f0' }}>
                                                • {m.username} 
                                                {m.tags?.map(t => (
                                                    <span key={t.tagId} className="tag">{t.tagName}</span>
                                                ))}
                                                {section.status === 'owner' && (
                                                    <button 
                                                        onClick={() => addTag(g.id, m.id)} 
                                                        style={{ padding: '2px 6px', fontSize: '0.7rem', marginLeft: '10px' }}
                                                    >
                                                        + Etichetă
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '0.8rem', color: '#999' }}>Niciun membru momentan.</p>
                                    )}
                                </div>

                                {section.status === 'owner' && (
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                                        <input 
                                            placeholder="Caută username" 
                                            onChange={e => setSearchUser(e.target.value)} 
                                            style={{ padding: '8px' }} 
                                        />
                                        <button onClick={() => addMember(g.id)} style={{ width: '100%', marginTop: '5px' }}>Adaugă Membru</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Groups;
import React, { useState, useEffect } from 'react';
import API from '../api';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [newGroupName, setNewGroupName] = useState('');

    const fetchGroups = async () => {
        const { data } = await API.get('/groups');
        setGroups(data);
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
            await API.post(`/groups/${groupId}/members`, { username: searchUser });
            alert("Membru invitat!");
            fetchGroups();
        } catch (err) { alert("Utilizatorul nu a fost găsit."); }
    };

    const addTag = async (groupId, userId) => {
        const tagName = window.prompt("Introdu eticheta (ex: Vegetarian, Vegan, Carnivor):");
        if (tagName) {
            await API.post(`/groups/${groupId}/members/${userId}/tags`, { name: tagName });
            fetchGroups();
        }
    };

    return (
        <div className="container">
            <h2 style={{ color: 'var(--primary-green)' }}>Management Grupuri</h2>
            
            <div className="card">
                <h3>Creează un grup nou</h3>
                <form onSubmit={createGroup} style={{ display: 'flex', gap: '10px' }}>
                    <input placeholder="Numele grupului (ex: Familie, Vecini)" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
                    <button type="submit">Creează</button>
                </form>
            </div>

            {groups.map(section => (
                <div key={section.status} style={{ marginTop: '30px' }}>
                    <h3 style={{ textTransform: 'capitalize' }}>Grupuri în care ești {section.status}</h3>
                    <div className="grid">
                        {section.groups.map(g => (
                            <div key={g.id} className="group-card">
                                <h4>{g.name}</h4>
                                <div style={{ margin: '10px 0' }}>
                                    <strong>Membri:</strong>
                                    {g.Members?.map(m => (
                                        <div key={m.id} style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                                            • {m.username} 
                                            {m.GroupMemberTag?.map(t => <span key={t.id} className="tag">{t.name}</span>)}
                                            {section.status === 'owner' && <button onClick={() => addTag(g.id, m.id)} style={{ padding: '2px 6px', fontSize: '0.7rem', marginLeft: '10px' }}>+ Tag</button>}
                                        </div>
                                    ))}
                                </div>
                                {section.status === 'owner' && (
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                                        <input placeholder="Caută username" onChange={e => setSearchUser(e.target.value)} style={{ padding: '8px' }} />
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
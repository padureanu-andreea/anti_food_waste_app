import React, { useState, useEffect } from 'react';
import API from '../api';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [inviteData, setInviteData] = useState({ groupId: '', userId: '' });

    const fetchGroups = async () => {
        const { data } = await API.get('/groups'); //
        setGroups(data);
    };

    useEffect(() => { fetchGroups(); }, []);

    const createGroup = async (e) => {
        e.preventDefault();
        await API.post('/groups', { name: newGroupName });
        setNewGroupName('');
        fetchGroups();
    };

    return (
        <div className="container">
            <h2>Grupurile Mele</h2>
            <form onSubmit={createGroup}>
                <input placeholder="Nume Grup Nou" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                <button type="submit">Creează Grup</button>
            </form>

            {groups.map(section => (
                <div key={section.status}>
                    <h3>Grupuri ca {section.status}</h3>
                    {section.groups.map(g => (
                        <div key={g.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '5px' }}>
                            <strong>{g.name}</strong>
                            {section.status === 'owner' && (
                                <div style={{ marginTop: '5px' }}>
                                    <input placeholder="ID Utilizator de invitat" onChange={e => setInviteData({ groupId: g.id, userId: e.target.value })} />
                                    <button onClick={async () => {
                                        await API.post(`/groups/${g.id}/members`, { userId: inviteData.userId });
                                        alert("Membru adăugat!");
                                    }}>Invită</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Groups;
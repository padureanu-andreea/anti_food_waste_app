import React, { useState, useEffect } from 'react';
import API from '../api';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [searchUser, setSearchUser] = useState('');

    const fetchGroups = async () => {
        const { data } = await API.get('/groups');
        setGroups(data);
    };

    useEffect(() => { fetchGroups(); }, []);

    const addMember = async (groupId) => {
        try {
            // Backend-ul tău are nevoie de ID-ul userului, deci aici ar trebui un search real. 
            // Pentru simplitate, folosim username-ul dacă backend-ul îl suportă.
            await API.post(`/groups/${groupId}/members`, { username: searchUser });
            alert("Membru invitat!");
            fetchGroups();
        } catch (err) { alert("Utilizatorul nu a fost găsit."); }
    };

    const addTag = async (groupId, userId) => {
        const tagName = window.prompt("Introdu eticheta (ex: Vegetarian, Fără Gluten, Iubitor de zacusca):");
        if (tagName) {
            await API.post(`/groups/${groupId}/members/${userId}/tags`, { name: tagName });
            fetchGroups();
        }
    };

    return (
        <div className="container">
            <h2>Management Grupuri Sociale</h2>
            {groups.map(section => (
                <div key={section.status}>
                    <h3>Grupuri în care ești {section.status === 'owner' ? 'Proprietar' : 'Membru'}</h3>
                    {section.groups.map(g => (
                        <div key={g.id} className="group-card" style={{ background: '#f9f9f9', padding: '15px', marginBottom: '10px' }}>
                            <h4>{g.name}</h4>
                            <div className="members">
                                <h5>Membri:</h5>
                                {g.Members && g.Members.map(m => (
                                    <div key={m.id}>
                                        • {m.username} 
                                        {m.GroupMemberTag && m.GroupMemberTag.map(t => <span className="tag">[{t.name}]</span>)}
                                        {section.status === 'owner' && <button onClick={() => addTag(g.id, m.id)}>+</button>}
                                    </div>
                                ))}
                            </div>
                            {section.status === 'owner' && (
                                <div className="invite">
                                    <input placeholder="Username prieten" onChange={e => setSearchUser(e.target.value)} />
                                    <button onClick={() => addMember(g.id)}>Invită</button>
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
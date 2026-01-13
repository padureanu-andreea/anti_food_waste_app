import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const Profile = () => {
  // Preluăm datele utilizatorului din contextul global
  const { user, setUser } = useContext(AuthContext);

  // Starea locală pentru gestionarea formularului de editare
  const [formData, setFormData] = useState({
    username: user?.username || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Apelăm ruta PATCH /auth/me pentru a actualiza datele în baza de date
      const { data } = await API.patch('/auth/me', formData);
      
      // Actualizăm starea globală a utilizatorului cu noile date primite de la backend
      setUser(data.user);
      alert("Profilul tău AntiFoodWaste a fost actualizat cu succes!");
    } catch (err) {
      // Afișăm erorile primite (ex: username deja existent)
      alert(err.response?.data?.message || "Eroare la actualizarea profilului.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: 'var(--primary-green)', marginBottom: '10px' }}>
          Gestionare Profil <span className="tag">Eco-Member</span>
        </h2>
        <p style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          Modifică datele tale pentru a facilita comunicarea în cadrul grupurilor. 
          <strong> Telefonul este vizibil doar pentru cei cărora le accepți revendicările.</strong>
        </p>

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '600' }}>Nume utilizator (unic):</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({ ...formData, username: e.target.value })} 
              required 
              placeholder="Username"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '600' }}>Număr de telefon (07xxxxxxxx):</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="Ex: 0722123456"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: '600' }}>Bio / Scurtă descriere:</label>
            <textarea 
              value={formData.bio} 
              onChange={e => setFormData({ ...formData, bio: e.target.value })} 
              placeholder="Spune-le celorlalți despre obiectivele tale eco..."
              style={{ height: '100px', resize: 'vertical' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', marginTop: '10px' }}>
            Salvează Modificările
          </button>
        </form>
      </div>

      {/* Secțiune de previzualizare rapidă a cardului de profil */}
      <div className="category-section" style={{ marginTop: '30px' }}>
        <h3>Previzualizare Profil</h3>
        <div className="card" style={{ borderLeft: '5px solid var(--primary-green)' }}>
          <h4>{user?.username}</h4>
          <p><strong>Contact:</strong> {user?.phone || 'Fără telefon setat'}</p>
          <p><strong>Despre:</strong> {user?.bio || 'Nicio descriere adăugată.'}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
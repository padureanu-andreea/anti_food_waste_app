# Aplicație web pentru prevenirea risipei de alimente

## Obiectiv
Realizarea unei aplicații web prin care utilizatorii pot să ofere alimente pe care nu le mai consumă, contribuind la reducerea risipei alimentare și la încurajarea comportamentelor sustenabile într-un mod bazat pe comunitate.

---

## Descriere generală
Aplicația are rolul de a-i ajuta pe utilizatori să conștientizeze risipa de alimente și să colaboreze între ei pentru a reutiliza alimentele care altfel ar fi aruncate.

Platforma oferă o experiență prietenoasă și interactivă, integrându-se cu rețelele sociale pentru a motiva implicarea comunității.

---

## Funcționalități principale

- **Gestionarea alimentelor:**  
  Ca utilizator, pot să creez o listă de alimente organizată pe categorii (ex: lactate, legume, carne etc.), reprezentând ce am în frigider.

- **Alerte de expirare:**  
  Primesc notificări când un produs se apropie de termenul de valabilitate. Pot marca acele produse ca „disponibile” pentru alți utilizatori.

- **Grupuri de prieteni și preferințe alimentare:**  
  Pot să definesc grupuri de prieteni și să-i etichetez (ex: vegetarieni, carnivori, iubitori de zacuscă). Îmi invit prietenii să vadă lista mea de alimente disponibile.

- **Distribuire de produse:**  
  Un alt utilizator poate revendica („claim”) un produs marcat ca disponibil.

- **Integrare social media:**  
  Posibilitatea de a posta pe Instagram și Facebook produsele disponibile, pentru a atrage mai mulți doritori.

---

## Arhitectura proiectului

### Frontend
- Tip aplicație: Single Page Application
- Framework bazat pe componente: React.js 
- Rol: Interfața cu utilizatorul, gestionarea sesiunilor și integrarea cu API-ul backend

### Backend
- Mediu de rulare: Node.js
- Arhitectură: RESTful API

### Bază de date
- Tip: Relațională (ex: PostgreSQL, MySQL)
- Acces: printr-un ORM (ex: Sequelize pentru Node.js)

### Servicii externe
- Integrare cu API-urile Facebook și Instagram pentru postarea produselor disponibile.

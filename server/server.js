// server.js — tylko składa całość i odpala serwer.
// Logika siedzi w osobnych plikach:
//   db.js                    → baza i tabele
//   middleware/requireAuth.js → bramkarz (sprawdzanie tokena)
//   routes/auth.js           → rejestracja, logowanie, /me, wylogowanie

const express = require('express');
const authRoutes = require('./routes/auth'); // LUKA 5: ścieżka do routes/auth.js (z folderu server)

const app = express();
app.use(express.json());           // rozpakowuje JSON do req.body
app.use(express.static('public')); // wydaje strony z folderu public

app.get('/', (req, res) => {
  res.send('Pulse serwer działa!');
});

app.use(authRoutes); // podpinamy wszystkie okienka z routes/auth.js

app.listen(3000, () => {
  console.log('Serwer słucha na porcie 3000');
});

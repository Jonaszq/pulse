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


app.use((err, req, res, next) => {
  console.error(err); // szczegóły tylko w konsoli serwera, dla Ciebie

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Zły format danych' });
  }

  res.status(500).json({ error: 'Coś poszło nie tak po stronie serwera' });
});

app.listen(3000, () => {
  console.log('Serwer słucha na porcie 3000');
});

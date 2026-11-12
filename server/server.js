const express = require('express');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('pulse.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Pulse serwer działa!');
});

app.post('/register', async(req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Brakuje danych' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Hasło musi mieć min. 8 znaków' });
  }
  const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);

  console.log(existing);
  if(existing !== undefined){
    return res.status(409).json({error : "email sie powtarza "});
  }

  const passwordHash = await bcrypt.hash(password, 10);
  console.log(passwordHash);

  db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
  .run(name, email, passwordHash);

  res.status(201).json({ message: 'Konto założone (na niby)' });
});

app.listen(3000, () => {
  console.log('Serwer słucha na porcie 3000');
});
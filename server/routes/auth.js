// routes/auth.js — wszystkie okienka związane z kontem:
// rejestracja, logowanie, „kim jestem” i wylogowanie.

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth'); // LUKA 3: ścieżka do bramkarza (z folderu routes)

// Router to taka „mini-aplikacja” z własnymi okienkami.
// W server.js podpinamy go jedną linijką.
const router = express.Router();

// --- Rejestracja ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Brakuje danych' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Hasło musi mieć min. 8 znaków' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Ten e-mail ma już konto' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, passwordHash);

  res.status(201).json({ message: 'Konto założone' });
});

// --- Logowanie ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Podaj e-mail i hasło' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Zły e-mail lub hasło' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Zły e-mail lub hasło' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 dni

  db.prepare('INSERT INTO tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, user.id, expiresAt);

  res.status(200).json({ message: 'Zalogowano', token: token });
});

// --- Kim jestem? (wymaga tokena) ---
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});

// --- Wylogowanie (wymaga tokena) ---
router.post('/logout', requireAuth, (req, res) => {
  db.prepare('DELETE FROM tokens WHERE token = ?').run(req.token);
  res.json({ message: 'Wylogowano' });
});

module.exports = router; // LUKA 4: co ten plik wystawia?

// routes/auth.js — wszystkie okienka związane z kontem:
// rejestracja, logowanie, „kim jestem” i wylogowanie.

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/requireAuth'); // LUKA 3: ścieżka do bramkarza (z folderu routes)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 50;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // okno: 15 minut
  limit: 5,                   // max 5 prób w tym oknie
  skipSuccessfulRequests: true, // poprawne logowania nie wliczają się do limitu
  message: { error: 'Za dużo prób logowania. Spróbuj za 15 minut.' },
});

// Router to taka „mini-aplikacja” z własnymi okienkami.
// W server.js podpinamy go jedną linijką.
const router = express.Router();

// --- Rejestracja ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Wszystko ma być tekstem — inaczej (np. obiekt) bcrypt lub baza się wywalą.
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Brakuje danych' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return res.status(400).json({ error: 'Brakuje danych' });
  }
  if (cleanName.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `Imię może mieć maks. ${MAX_NAME_LENGTH} znaków` });
  }
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return res.status(400).json({ error: 'To nie wygląda na e-mail' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Hasło musi mieć min. 8 znaków' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'Ten e-mail ma już konto' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(cleanName, cleanEmail, passwordHash);

  res.status(201).json({ message: 'Konto założone' });
});

// --- Logowanie ---
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Podaj e-mail i hasło' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return res.status(400).json({ error: 'Podaj e-mail i hasło' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
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

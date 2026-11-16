// middleware/requireAuth.js — „bramkarz”.
// Stoi przed okienkami, które wymagają zalogowania, i sprawdza token.

const db = require('../db'); // LUKA 1: ścieżka do db.js. Ten plik jest w podfolderze!

function requireAuth(req, res, next) {
  const header = req.headers.authorization; // "Bearer 016db..."
  if (!header) {
    return res.status(401).json({ error: 'Brak tokena' });
  }
  const token = header.replace('Bearer ', '');

  const row = db.prepare('SELECT * FROM tokens WHERE token = ?').get(token);
  if (!row || row.expires_at < new Date().toISOString()) {
    return res.status(401).json({ error: 'Zły lub wygasły token' });
  }

  req.userId = row.user_id; // przypinamy numer użytkownika
  req.token = token;        // i sam token (do wylogowania)
  next();                   // „następny!” — puszczamy do okienka
}

module.exports = requireAuth; // LUKA 2: co ten plik wystawia na zewnątrz?

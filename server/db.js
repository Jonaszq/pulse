// db.js — wszystko, co dotyczy bazy danych, w jednym miejscu.
// Inne pliki dostają gotowe połączenie przez: const db = require('./db');

const Database = require('better-sqlite3');

const db = new Database('pulse.db');
db.pragma('foreign_keys = ON'); // SQLite domyślnie nie pilnuje kluczy obcych

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  )
`);

// Wystawiamy połączenie na zewnątrz, żeby inne pliki mogły go użyć.
module.exports = db;

const Database = require('better-sqlite3');
const db = require('../db/db');


// Récupérer un utilisateur par ID
function getUserById(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(userId); // Renvoie directement la ligne ou undefined
}

// Récupérer un utilisateur par nom d'utilisateur
function getUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

// Créer un utilisateur
function createUser(username, hashedPassword) {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const result = stmt.run(username, hashedPassword);

  // On retourne l'utilisateur nouvellement inséré
  return getUserById(result.lastInsertRowid);
}

function searchUsersByUsername(query, excludeUserId = null) {
  let stmt;
  if (excludeUserId) {
    stmt = db.prepare('SELECT id, username FROM users WHERE username LIKE ? AND id != ?');
    return stmt.all(`%${query}%`, excludeUserId);
  } else {
    stmt = db.prepare('SELECT id, username FROM users WHERE username LIKE ?');
    return stmt.all(`%${query}%`);
  }
}

module.exports = {
  getUserById,
  getUserByUsername,
  createUser,
  searchUsersByUsername
};

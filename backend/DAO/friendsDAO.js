const db = require('../db/db');

// Récupérer la liste des amis d’un utilisateur

function getFriends(userId) {
  const stmt = db.prepare('SELECT friend_id FROM friends WHERE user_id = ?');
  return stmt.all(userId); // renvoie un tableau d'objets { friend_id: ... }
}



// Vérifier si deux utilisateurs sont amis
function areFriends(userId, friendId) {
  const stmt = db.prepare(`SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?`);
  return !!stmt.get(userId, friendId);
}

module.exports = {
  getFriends,
  areFriends
};

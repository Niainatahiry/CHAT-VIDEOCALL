const db = require('../db/db');

function addFriendRequest(fromUserId, toUserId, status = 'pending') {
  const stmt = db.prepare(`INSERT INTO friend_requests (from_user_id, to_user_id, status) VALUES (?, ?, ?)`);
  stmt.run(fromUserId, toUserId, status);
}

// Fonction pour ajouter une relation d’amitié bi-directionnelle
async function addFriendship(userId, friendId) {
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)
  `);

  insertStmt.run(userId, friendId);
  insertStmt.run(friendId, userId);
}


function updateFriendRequestStatus(fromUserId, toUserId, newStatus) {
  const stmt = db.prepare(`
    UPDATE friend_requests 
    SET status = ? 
    WHERE from_user_id = ? AND to_user_id = ?
  `);
  stmt.run(newStatus, fromUserId, toUserId);
}
  async function getFriendRequests(userId) {
    return db.prepare('SELECT * FROM friend_requests WHERE to_user_id = ? AND status = ?')
             .all(userId, 'pending');
  }

function acceptFriendRequest(fromUserId, toUserId) {
  updateFriendRequestStatus(fromUserId, toUserId, 'accepted');
}

function rejectFriendRequest(fromUserId, toUserId) {
  updateFriendRequestStatus(fromUserId, toUserId, 'rejected');
}

function isFriendRequestExists(userId1, userId2) {
  const stmt = db.prepare(`
    SELECT 1 FROM friend_requests
    WHERE (from_user_id = ? AND to_user_id = ?)
       OR (from_user_id = ? AND to_user_id = ?)
    LIMIT 1
  `);
  const result = stmt.get(userId1, userId2, userId2, userId1);
  return !!result;
}


module.exports = {
  getFriendRequests,
  addFriendRequest,
  updateFriendRequestStatus,
  addFriendship,
  isFriendRequestExists,
  acceptFriendRequest,
  rejectFriendRequest
};

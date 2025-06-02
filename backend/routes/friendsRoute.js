const express = require('express');
const router = express.Router();
const StreamChat = require('stream-chat').StreamChat;
const db = require('../db/db');


const {
  getFriends
 // Assurez-vous que cette fonction est bien exportée
} = require('../DAO/friendsDao');


const streamServerClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// GET /api/messages/:userId/:friendId
router.get('/messages/:userId/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;

  if (!userId || !friendId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  try {
    const channelId = [userId, friendId].sort().join('-');
    const channel = streamServerClient.channel('messaging', channelId);

    await channel.watch();

    const messages = channel.state.messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      user: msg.user_id,
      created_at: msg.created_at,
      type: msg.type,
      data: msg.data || {},
    }));

    res.json({ channelId, messages });
  } catch (err) {
    console.error('Erreur récupération messages:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }

});

// Route pour récupérer les amis d'un user
router.get('/friends/:userId', (req, res) => {
  const userId = req.params.userId;

  // getFriends doit renvoyer un tableau { friend_id }
  const friendIdsRows = getFriends(userId);

  if (!friendIdsRows || friendIdsRows.length === 0) {
    return res.json([]); // pas d'amis
  }

  const friendIds = friendIdsRows.map(row => row.friend_id);

  const placeholders = friendIds.map(() => '?').join(',');

  // Ici on ne récupère que id et username qui existent dans la table users
  const stmt = db.prepare(`SELECT id, username FROM users WHERE id IN (${placeholders})`);
  const friends = stmt.all(...friendIds);

  res.json(friends);
});

module.exports = router;

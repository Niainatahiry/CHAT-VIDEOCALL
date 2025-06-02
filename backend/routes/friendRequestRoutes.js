const express = require('express');
const router = express.Router();
const StreamChat = require('stream-chat').StreamChat;
const {
  addFriendRequest,
  updateFriendRequestStatus,
  addFriendship,
  isFriendRequestExists,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests, // Assurez-vous que cette fonction est bien exportée
} = require('../DAO/friendRequestDao');

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

const streamServerClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

// Créer une demande d'amitié
router.post('/request/:targetUserId', async (req, res) => {
  const { targetUserId } = req.params;
  const { userId } = req.body;

  if (!userId || !targetUserId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  if (userId === targetUserId) {
    return res.status(400).json({ error: "Impossible de s'ajouter soi-même" });
  }

  try {
    const exists = await isFriendRequestExists(userId, targetUserId);
    if (exists) {
      return res.status(409).json({ error: 'Une demande d’amitié existe déjà entre ces deux utilisateurs' });
    }

    const channelId = [userId, targetUserId].sort().join('-');
    const channel = streamServerClient.channel('messaging', channelId, {
      members: [userId, targetUserId],
      created_by_id: userId,
    });
    await channel.watch();

    await channel.sendMessage({
      text: 'Demande d’ami',
      user_id: userId,
      data: {
        status: 'pending',
        messageType: 'friend_request',
      },
    });

    await addFriendRequest(userId, targetUserId, 'pending');

    res.json({ message: 'Demande envoyée', channelId: channel.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la demande d’ami' });
  }
});

// Répondre à une demande d'amitié
router.post('/respond/:fromUserId', async (req, res) => {
  const fromUserId = req.params.fromUserId;
  const { userId, action } = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId manquant ou invalide' });
  }

  try {
    if (action === 'accept') {
      await acceptFriendRequest(fromUserId, userId);
      await addFriendship(fromUserId, userId);

      await streamServerClient.upsertUser({ id: fromUserId });
      await streamServerClient.upsertUser({ id: userId });

      const channelId = [fromUserId, userId].sort().join('-');
      const channel = streamServerClient.channel('messaging', channelId, {
        members: [fromUserId, userId],
        created_by_id: userId,
      });

      await channel.watch();
    } else if (action === 'reject') {
      await rejectFriendRequest(fromUserId, userId);
    } else {
      return res.status(400).json({ error: 'Action non reconnue' });
    }

    res.json({ message: 'Action effectuée avec succès' });
  } catch (err) {
    console.error('Erreur dans friendRequest/respond:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// Récupérer les demandes d’amis pour un utilisateur
router.get('/requests/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('userId reçu dans route GET:', userId);

  try {

    const requests = await getFriendRequests(userId); // Ajout du `await` ici
    res.json(requests);
  } catch (err) {
    console.error('Erreur dans GET /requests:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

module.exports = router;

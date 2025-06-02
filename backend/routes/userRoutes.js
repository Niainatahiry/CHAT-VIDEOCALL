const express = require('express');
const bcrypt = require('bcrypt');
const StreamChat = require('stream-chat').StreamChat;
const userDAO = require('../DAO/userDAO');

const router = express.Router();

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  console.log('Données reçues du client (register):', req.body); 
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username et password requis' });
  }

  const existingUser = await userDAO.getUserByUsername(username);
  if (existingUser) {
    return res.status(409).json({ error: 'Utilisateur déjà existant' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await userDAO.createUser(username, hashedPassword); // renvoie { id, username, password }

  // Création côté Stream avec userId auto-généré et username
  const streamResponse = await serverClient.upsertUser({
    id: newUser.id.toString(),
    name: newUser.username
  });
  console.log('Réponse Stream (register) :', streamResponse);

  res.json({ message: 'Utilisateur créé avec succès' });
});

router.post('/token', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username et password requis' });
    }

    const user = await userDAO.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // user.id est ton userId auto-incrémenté interne
    const streamResponse = await serverClient.upsertUser({ id: user.id.toString(), name: user.username });
    console.log('Réponse Stream (token) :', streamResponse);

    const token = serverClient.createToken(user.id.toString());

    res.json({ token, userId: user.id.toString(), username: user.username });
  } catch (error) {
    console.error('Erreur dans /token:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.get('/users', async (req, res) => {
  try {
    const response = await serverClient.queryUsers({});
    // response.users contient le tableau des utilisateurs
    res.json({ users: response.users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs Stream:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});
router.delete('/stream-users', async (req, res) => {
  try {
    // Récupérer tous les utilisateurs
    const response = await serverClient.queryUsers({});
    const users = response.users;

    // Supprimer tous les utilisateurs en parallèle
    await Promise.all(
      users.map(user =>
        serverClient.deleteUser(user.id, { mark_messages_deleted: true })
      )
    );

    res.json({ message: `${users.length} utilisateurs Stream supprimés.` });
  } catch (error) {
    console.error('Erreur lors de la suppression de tous les utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  }
});

// GET /api/user/search?q=machin&exclude=123
router.get('/search', (req, res) => {
  const { q, exclude } = req.query;

  if (!q) return res.status(400).json({ error: 'Paramètre q requis' });

  try {
    const users = userDAO.searchUsersByUsername(q, exclude);
    res.json(users);
  } catch (err) {
    console.error('Erreur lors de la recherche utilisateur', err);
    res.status(500).json({ error: 'Erreur interne' });
  }
});





  

module.exports = router;

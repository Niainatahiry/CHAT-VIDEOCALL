const express = require('express');
const cors = require('cors');
const db = require('./db/db');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const friendRequestRoutes = require('./routes/friendRequestRoutes');
const friendsRoute = require('./routes/friendsRoute'); // Correction ici

const app = express();

app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/user', userRoutes);
app.use('/api/friendrequest', friendRequestRoutes);
app.use('/api/friend', friendsRoute); // Correction ici

app.listen(3000, () => {
  console.log('Backend démarré sur http://localhost:3000');
});

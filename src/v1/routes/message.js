const express = require('express');
const messageController = require('../controllers/message');

const router = express.Router();

// Route to find messages between two users
router.get('/', async (req, res) => {
  const { user1Id, user2Id } = req.query;

  try {
    const messages = await messageController.findMessagesBetweenUsers(user1Id, user2Id);
    res.json(messages);
  } catch (error) {
    console.error('Error finding messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

module.exports = router;

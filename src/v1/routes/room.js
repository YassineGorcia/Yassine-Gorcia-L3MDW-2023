const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room');



// Create a new room
router.post('/', roomController.createRoom);

// Get the room for a specific board
router.get('/:boardId', roomController.getRoomByBoardId);

// Add a new message to the room
router.post('/:roomId/messages', roomController.addMessageToRoom);

// Delete a room
router.delete('/:roomId', roomController.deleteRoom);

router.get('/:roomId/messages', roomController.getRoomMessages);


module.exports = router;

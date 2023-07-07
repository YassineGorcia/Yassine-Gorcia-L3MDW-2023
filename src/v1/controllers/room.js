const Room = require('../models/room');

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { boardId, members } = req.body;

    const room = new Room({
      boardId,
      members
    });

    await room.save();

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the room.' });
  }
};

// Get the room for a specific board
// Get the room ID for a specific board
exports.getRoomByBoardId = async (req, res) => {
    try {
      const { boardId } = req.params;
  
      const room = await Room.findOne({ boardId });
  
      if (!room) {
        return res.status(404).json({ error: 'Room not found.' });
      }
  
      const roomId = room._id;
  
      res.status(200).json({ roomId });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while retrieving the room ID.' });
    }
  };
  
  

// Get all messages of a specific room
exports.getRoomMessages = async (req, res) => {
    try {
      const { roomId } = req.params;
  
      const room = await Room.findById(roomId);
  
      if (!room) {
        return res.status(404).json({ error: 'Room not found.' });
      }
  
      const messages = room.messages.map((message) => ({
        sender: message.sender,
        message: message.message
      }));
  
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while retrieving the messages of the room.' });
    }
  };
  

// Add a new message to the room
exports.addMessageToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { sender, message } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const newMessage = {
      sender,
      message
    };

    room.messages.push(newMessage);
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while adding the message to the room.' });
  }
};


exports.updateRoomMembers = async (req, res) => {
    try {
      const { roomId } = req.params;
      const { members } = req.body;
  
      const room = await Room.findByIdAndUpdate(roomId, { members }, { new: true });
  
      if (!room) {
        return res.status(404).json({ error: 'Room not found.' });
      }
  
      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the room members.' });
    }
  };

// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    await Room.findByIdAndDelete(roomId);

    res.status(200).json({ message: 'Room deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the room.' });
  }
};

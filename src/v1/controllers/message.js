const message = require('../models/message');


// Controller function to find messages between two users
const findMessagesBetweenUsers = async (user1Id, user2Id) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    }).sort({ timestamp: 1 });
    return messages;
  } catch (error) {
    console.error('Error finding messages:', error);
    throw error;
  }
};

module.exports = {
  findMessagesBetweenUsers,
};

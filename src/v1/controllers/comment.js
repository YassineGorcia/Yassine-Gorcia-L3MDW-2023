const Comment = require('../models/comment');

// Create a new comment
// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { taskId, userId, content } = req.body;

    const comment = new Comment({
      task: taskId,
      user: userId,
      content
    });

    const savedComment = await comment.save();

    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// Get all comments
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
};

// Get comment by ID
exports.getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comment' });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true });
    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(deletedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Get comments by task ID
// Get comments by task ID
exports.getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId }).exec();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
};
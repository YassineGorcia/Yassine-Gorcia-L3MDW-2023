const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment');

// Create a new comment
router.post('/', commentController.createComment);

// Get all comments
router.get('/', commentController.getAllComments);

// Get comment by ID
router.get('/:commentId', commentController.getCommentById);


// Get comments by task ID
router.get('/task/:taskId/comments', commentController.getCommentsByTaskId);


// Update comment
router.put('/:commentId', commentController.updateComment);

// Delete comment
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;

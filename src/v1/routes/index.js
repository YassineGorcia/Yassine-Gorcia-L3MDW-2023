var router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/boards', require('./board'));
router.use('/boards/:boardId/sections', require('./section'));
router.use('/boards/:boardId/tasks', require('./task'));
router.use('/comments', require('./comment')); // Updated path for comments
router.use('/rooms', require('./room'));
router.use('/messages', require('./message'));

module.exports = router;

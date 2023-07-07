const router = require('express').Router();
const userController = require('../controllers/user');
const { body } = require('express-validator');
const validation = require('../handlers/validation');
const tokenHandler = require('../handlers/tokenHandler');
const User = require('../models/user');

router.post(
  '/signup',
  body('username')
    .isLength({ min: 8 })
    .withMessage('Username must be at least 8 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .isLength({ min: 8 })
    .withMessage('Confirm password must be at least 8 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address'),
  body('number')
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('username').custom((value) => {
    return User.findOne({ username: value }).then((user) => {
      if (user) {
        return Promise.reject('Username already used');
      }
    });
  }),
  body('email').custom((value) => {
    return User.findOne({ email: value }).then((user) => {
      if (user) {
        return Promise.reject('Email already used');
      }
    });
  }),
  validation.validate,
  userController.register
);

router.post(
  '/login',
  body('username').isLength({ min: 8 }).withMessage(
    'username must be at least 8 characters'
  ),
  body('password').isLength({ min: 8 }).withMessage(
    'password must be at least 8 characters'
  ),
  validation.validate,
  userController.login
);

router.post(
  '/verify-token',
  tokenHandler.verifyToken,
  (req, res) => {
    res.status(200).json({ user: req.user });
  }
);

router.get(
  '/users',
  tokenHandler.verifyToken, // Add authentication middleware if required
  userController.getAllUsers
);

router.get('/users/:userId', userController.getUserById);

router.put(
  '/users/:userId',
  tokenHandler.verifyToken, // Add authentication middleware if required
  userController.updateUser
);

router.delete(
  '/users/:userId',
  tokenHandler.verifyToken, // Add authentication middleware if required
  userController.deleteUser
);

router.get('/search', userController.searchUsers);

module.exports = router;

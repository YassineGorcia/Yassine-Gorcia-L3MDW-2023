const User = require('../models/user');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  const { username, password, email, number, role } = req.body;
  try {
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET_KEY
    );

    const newUser = await User.create({
      username,
      password: encryptedPassword,
      email,
      number,
      role, 
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register user', error });
  }
};




// Login a user
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).select('password username');
    if (!user) {
      return res.status(401).json({
        errors: [
          {
            param: 'username',
            msg: 'Invalid username '
          }
        ]
      })
    }

    const decryptedPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPass !== password) {
      return res.status(401).json({
        errors: [
          {
            param: 'password',
            msg: 'Invalid password'
          }
        ]
      })
    }

    user.password = undefined;

    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login user', error });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user', error });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, password, photo, number, email, teams, role } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided in the request body
    if (username) {
      user.username = username;
    }
    
    if (password) {
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        process.env.PASSWORD_SECRET_KEY
      );
      user.password = encryptedPassword;
    }
    
    if (photo) {
      user.photo = photo;
    }
    
    if (number) {
      user.number = number;
    }
    
    if (email) {
      user.email = email;
    }
    
    if (teams) {
      user.teams = teams;
    }
    
    if (role) {
      user.role = role;
    }
    
    const updatedUser = await user.save();
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error });
  }
};

    
    // Delete user
    exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
    const user = await User.findById(userId);
    if (!user) {
    return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();

res.status(200).json({ message: 'User deleted successfully' });
} catch (error) {
  res.status(500).json({ message: 'Failed to delete user', error });
  }
  };

  exports.searchUsers = async (req, res) => {
    const search = req.query.search;
    try {
      const users = await User.find({ username: { $regex: new RegExp(search, 'i') } });
      res.status(200).json(users); // Return the users
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Failed to search users', error });
    }
  };
  
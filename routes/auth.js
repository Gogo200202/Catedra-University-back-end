const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user, token) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    role: user.role,
    jwt: token,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const allowedRoles = ['student'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const user = await User.create({ name, email, password, role: userRole });
    const token = generateToken(user);

    res.status(201).json(userResponse(user, token));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);

    res.json(userResponse(user, token));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  res.json(userResponse(req.user, token));
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, photoUrl, password } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (password) updates.password = password;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    const token = req.headers.authorization.split(' ')[1];
    res.json(userResponse(user, token));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

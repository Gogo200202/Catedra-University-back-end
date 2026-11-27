const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Professor = require('../models/Professor');

const JWT_SECRET = process.env.JWT_SECRET || 'catedra-university-secret-key';

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.professorId) {
      const professor = await Professor.findById(decoded.professorId);
      if (!professor) return res.status(401).json({ error: 'Professor not found' });
      const basic = professor.Basic_Information || {};
      req.professor = professor;
      req.user = {
        _id: professor._id,
        name: [basic.firstName && basic.firstName.bg, basic.middleName && basic.middleName.bg, basic.lastName && basic.lastName.bg]
          .filter(Boolean)
          .join(' '),
        email: professor.professorLoginAccount.email,
        photoUrl: basic.photo && basic.photo.bg ? basic.photo.bg : null,
        role: 'teacher',
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth, authorize, JWT_SECRET };

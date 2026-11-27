const express = require('express');
const jwt = require('jsonwebtoken');
const { auth, authorize, JWT_SECRET } = require('../middleware/auth');
const Professor = require('../models/Professor');

const router = express.Router();
const profileManagers = ['secretary', 'systemAdmin', 'admin'];

function canEditProfessor(user, professor) {
  return profileManagers.includes(user.role)
    || (user.role === 'teacher' && professor._id.toString() === user._id.toString());
}

function professorName(professor, lang = 'bg') {
  const basic = professor.Basic_Information || {};
  return [basic.firstName && basic.firstName[lang], basic.middleName && basic.middleName[lang], basic.lastName && basic.lastName[lang]]
    .filter(Boolean)
    .join(' ');
}

// Professor login: the submitted password is checked against the hash stored on the Professor.
router.post('/auth', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const professor = await Professor.findOne({ 'professorLoginAccount.email': email })
      .select('+professorLoginAccount.passwordHash');
    const validPassword = professor && await professor.compareLoginPassword(password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { professorId: professor._id, role: 'teacher' },
      JWT_SECRET,
      { expiresIn: '7d' },
    );
    const basic = professor.Basic_Information || {};

    res.json({
      id: professor._id,
      name: professorName(professor),
      email: professor.professorLoginAccount.email,
      photoUrl: basic.photo && basic.photo.bg ? basic.photo.bg : null,
      role: 'teacher',
      jwt: token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all public professor profiles
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'Basic_Information.firstName.bg': regex },
        { 'Basic_Information.firstName.en': regex },
        { 'Basic_Information.middleName.bg': regex },
        { 'Basic_Information.middleName.en': regex },
        { 'Basic_Information.lastName.bg': regex },
        { 'Basic_Information.lastName.en': regex },
        { 'Education.researchInterests.bg': regex },
        { 'Education.researchInterests.en': regex },
        { 'Professional_Competences.programmingLanguages.language.bg': regex },
        { 'Professional_Competences.programmingLanguages.language.en': regex },
      ];
    }

    const [professors, total] = await Promise.all([
      Professor.find(filter)
        .sort({ 'Basic_Information.lastName.bg': 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Professor.countDocuments(filter),
    ]);

    res.json({
      data: professors,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one public professor profile
router.get('/:id', async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ error: 'Professor not found' });
    res.json(professor);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Professor not found' });
    res.status(500).json({ error: err.message });
  }
});

// Create a professor profile with its independent login credentials.
// The Professor model hashes passwordHash before saving; no User record is created.
router.post('/', auth, authorize(...profileManagers), async (req, res) => {
  try {
    const { professorLoginAccount, ...profile } = req.body;
    const email = String(professorLoginAccount && professorLoginAccount.email || '').trim().toLowerCase();
    const password = professorLoginAccount && professorLoginAccount.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'professorLoginAccount.email and professorLoginAccount.password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'professorLoginAccount.email must be a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const basicInfo = profile.Basic_Information || {};
    if (!professorLoginAccount.name && !professorName({ Basic_Information: basicInfo })) {
      return res.status(400).json({ error: 'Provide professorLoginAccount.name or a professor name' });
    }

    const professor = await Professor.create({
      ...profile,
      professorLoginAccount: { email, passwordHash: password },
    });

    res.status(201).json(professor);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Professor email already registered' });
    res.status(400).json({ error: err.message });
  }
});

// Teachers may edit their own profile; secretaries and system administrators may edit any.
router.put('/:id', auth, async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ error: 'Professor not found' });
    if (!canEditProfessor(req.user, professor)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updates = { ...req.body };
    delete updates.professorLoginAccount;

    professor.set(updates);
    await professor.save();
    res.json(professor);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Professor not found' });
    res.status(400).json({ error: err.message });
  }
});

// Only system administrators may delete professor profiles.
router.delete('/:id', auth, authorize('systemAdmin', 'admin'), async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);
    if (!professor) return res.status(404).json({ error: 'Professor not found' });
    res.json({ message: 'Professor deleted' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Professor not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

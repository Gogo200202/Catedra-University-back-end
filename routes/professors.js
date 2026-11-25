const express = require('express');
const { auth } = require('../middleware/auth');
const Professor = require('../models/Professor');

const router = express.Router();

// GET all professors (public)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'Basic_Information.firstName.bg': regex },
        { 'Basic_Information.firstName.en': regex },
        { 'Basic_Information.lastName.bg': regex },
        { 'Basic_Information.lastName.en': regex },
        { 'Education.researchInterests': regex },
        { 'Professional_Competences.programmingLanguages.language': regex },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const professors = await Professor.find(filter)
      .sort({ 'Basic_Information.lastName': 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Professor.countDocuments(filter);

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

// GET single professor (public)
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

// POST professor (admin)
router.post('/', auth, async (req, res) => {
  try {
    const professor = new Professor(req.body);
    await professor.save();
    res.status(201).json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT professor (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!professor) return res.status(404).json({ error: 'Professor not found' });
    res.json(professor);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Professor not found' });
    res.status(400).json({ error: err.message });
  }
});

// DELETE professor (admin)
router.delete('/:id', auth, async (req, res) => {
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
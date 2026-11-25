const express = require('express');
const { auth } = require('../middleware/auth');
const Publication = require('../models/Publication');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { year, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (year) {
      filter.year = Number(year);
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title: regex },
        { authors: regex },
        { venue: regex },
        { 'content.bg': regex },
        { 'content.en': regex },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const publications = await Publication.find(filter)
      .sort({ year: -1, createdAt: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Publication.countDocuments(filter);

    res.json({
      data: publications,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Publication not found' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    res.json(publication);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Publication not found' });
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const publication = new Publication(req.body);
    await publication.save();
    res.status(201).json(publication);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    res.json(publication);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Publication not found' });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    res.json({ message: 'Publication deleted' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Publication not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const { auth } = require('../middleware/auth');
const ResearchProject = require('../models/ResearchProject');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'name.bg': regex },
        { 'name.en': regex },
        { 'fundingOrganization.bg': regex },
        { 'fundingOrganization.en': regex },
        { 'description.bg': regex },
        { 'description.en': regex },
        { contractNumber: regex },
        { period: regex },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const projects = await ResearchProject.find(filter)
      .sort({ createdAt: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await ResearchProject.countDocuments(filter);

    res.json({
      data: projects,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Project not found' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await ResearchProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Project not found' });
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const project = new ResearchProject(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await ResearchProject.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Project not found' });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await ResearchProject.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Project not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

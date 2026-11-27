const express = require('express');
const University = require('../models/Education');

const router = express.Router();

// The education collection currently contains one curriculum document.
router.get('/', async (_req, res) => {
  try {
    const education = await University.findOne({});
    if (!education) return res.status(404).json({ error: 'Education data not found' });
    res.json(education);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const News = require('../models/News');

router.get('/', async (req, res) => {
  try {
    const { lang, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'newspaperName.bg': regex },
        { 'newspaperName.en': regex },
        { 'articles.title.bg': regex },
        { 'articles.title.en': regex },
        { 'articles.description.bg': regex },
        { 'articles.description.en': regex },
      ];
    }

    const news = await News.find(filter)
      .sort({ issueDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await News.countDocuments(filter);

    res.json({
      data: news,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const bilingualString = {
  bg: { type: String, default: '' },
  en: { type: String, default: '' },
};

const ArticleSchema = new mongoose.Schema({
  title: bilingualString,
  imageUrl: { type: String, default: '' },
  description: bilingualString,
  authors: [{ type: String }],
}, { _id: false });

const NewsSchema = new mongoose.Schema({
  newspaperName: bilingualString,
  issueDate: { type: Date, required: true },
  articles: [ArticleSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('News', NewsSchema);

const mongoose = require('mongoose');

const { Schema } = mongoose;

const localizedParagraphs = {
  bg: [String],
  en: [String],
};

// Combines the front-end `Publication` shape (src/data/research.ts) with the
// publication fields from md/Profesor.json ("selectedScientificPublications").
const PublicationSchema = new Schema({
  authors: [String],
  title: { type: String, required: true },
  venue: { type: String, default: '' },
  year: { type: Number, required: true },
  content: localizedParagraphs,

  // Optional bibliographic details from the thesis schema.
  publicationType: { type: String, default: '' },
  volume: { type: String, default: '' },
  issue: { type: String, default: '' },
  pages: { type: String, default: '' },
  doi: { type: String, default: '' },
  url: { type: String, default: '' },
  pdfFile: { type: String, default: '' },
}, {
  timestamps: true,
  collection: 'publications',
});

PublicationSchema.index({ year: -1 });

module.exports = mongoose.model('Publication', PublicationSchema);

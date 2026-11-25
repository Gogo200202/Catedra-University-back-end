const mongoose = require('mongoose');

const { Schema } = mongoose;

// Mirrors Record<Lang, string> in the front-end `src/data/research.ts`
// and the bilingual { bg, en } convention already used by models/News.js.
const localizedText = {
  bg: { type: String, default: '' },
  en: { type: String, default: '' },
};

const localizedParagraphs = {
  bg: [String],
  en: [String],
};

const ResearchProjectSchema = new Schema({
  name: localizedText,
  fundingOrganization: localizedText,
  period: { type: String, default: '' },
  contractNumber: { type: String, default: '' },
  description: localizedText,
  content: localizedParagraphs,
}, {
  timestamps: true,
  collection: 'researchprojects',
});

module.exports = mongoose.model('ResearchProject', ResearchProjectSchema);

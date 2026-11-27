const mongoose = require('mongoose');

// English / Bulgarian translation
const TranslationSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    bg: { type: String, required: true },
  },
  { _id: false },
);

// Bilingual class name
const ClassSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    bg: { type: String, required: true },
  },
  { _id: false },
);

// Semester has a list of bilingual classes.
const SemesterSchema = new mongoose.Schema(
  {
    classes: {
      type: [ClassSchema],
      default: [],
    },
  },
  { _id: false },
);

// Semester keys (semester1, semester2, ...) are dynamic in the supplied document,
// so preserve them while validating the bilingual specialization name.
const SpecializationSchema = new mongoose.Schema(
  {
    name: {
      type: TranslationSchema,
      required: true,
    },
  },
  {
    _id: false,
    strict: false,
  },
);

const DegreeSchema = new mongoose.Schema(
  {
    degree: {
      type: Map,
      of: SpecializationSchema,
      required: true,
    },
  },
  { _id: false },
);

const UniversitySchema = new mongoose.Schema(
  {
    Bachelor: DegreeSchema,
    Master: DegreeSchema,
    Doctorate: DegreeSchema,
  },
  {
    timestamps: true,
    collection: 'education',
  },
);

module.exports = mongoose.model('University', UniversitySchema);

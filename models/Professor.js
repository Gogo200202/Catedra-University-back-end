const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

// Bilingual sub-schema: { bg: String, en: String }
const bilingualSchema = new Schema({
  bg: { type: String, default: '' },
  en: { type: String, default: '' },
}, { _id: false });

const ProfessorSchema = new Schema({
  professorLoginAccount: {
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, select: false },
  },
  Basic_Information: {
    academicPosition: bilingualSchema,
    firstName: bilingualSchema,
    middleName: bilingualSchema,
    lastName: bilingualSchema,
    photo: bilingualSchema,
    dateOfBirth: bilingualSchema,
    placeOfBirth: bilingualSchema,
    officeAddress: bilingualSchema,
    officeNumber: bilingualSchema,
    administrativeFunction: bilingualSchema,
  },
  Education: {
    university: bilingualSchema,
    major: bilingualSchema,
    academicDegrees: [
      {
        degree: bilingualSchema,
        dissertationTitle: bilingualSchema,
        dateAcquired: bilingualSchema,
        scientificSpecialty: bilingualSchema,
      }
    ],
    academicTitles: [
      {
        title: bilingualSchema,
        dateAcquired: bilingualSchema,
        scientificSpecialty: bilingualSchema,
      }
    ],
    fieldsOfHigherEducation: [bilingualSchema],
    professionalFields: [bilingualSchema],
    researchInterests: [bilingualSchema],
  },
  Teaching_Activity: {
    bachelorsCourses: [bilingualSchema],
    mastersCourses: [bilingualSchema],
    phdCourses: [bilingualSchema],
  },
  Foreign_Languages: [
    {
      languageName: bilingualSchema,
      readingLevel: bilingualSchema,
      writingLevel: bilingualSchema,
      speakingLevel: bilingualSchema,
    }
  ],
  Work_Experience: [
    {
      period: {
        from: bilingualSchema,
        to: bilingualSchema,
      },
      organization: bilingualSchema,
      position: bilingualSchema,
      description: bilingualSchema,
    }
  ],
  Professional_Competences: {
    programmingLanguages: [
      {
        language: bilingualSchema,
        proficiencyLevel: bilingualSchema,
      }
    ],
    technologies: [bilingualSchema],
    platforms: [bilingualSchema],
    frameworks: [bilingualSchema],
    databases: [bilingualSchema],
    otherTechnicalSkills: [bilingualSchema],
  },
  Membership_in_Organizations: [
    {
      organization: bilingualSchema,
      membershipType: bilingualSchema,
      period: bilingualSchema,
    }
  ],
  Participation_in_Research_Projects: [
    {
      projectName: bilingualSchema,
      period: bilingualSchema,
      fundingOrganization: bilingualSchema,
      contractNumber: bilingualSchema,
      projectRole: bilingualSchema,
    }
  ],
  Publications: {
    summaryIndicators: {
      numberOfScientificArticles: { type: Number, default: 0 },
      numberOfInternationalReports: { type: Number, default: 0 },
      numberOfNationalReports: { type: Number, default: 0 },
    },
    booksAndTextbooks: [
      {
        authors: [String],
        title: bilingualSchema,
        publisher: bilingualSchema,
        isbn: bilingualSchema,
        year: bilingualSchema,
        publicationType: bilingualSchema,
      }
    ],
    selectedScientificPublications: [
      {
        authors: [String],
        title: bilingualSchema,
        publicationOrConference: bilingualSchema,
        volume: bilingualSchema,
        issue: bilingualSchema,
        pages: bilingualSchema,
        year: bilingualSchema,
        doi: bilingualSchema,
        url: bilingualSchema,
        pdfFile: bilingualSchema,
      }
    ],
  },
  Citations: {
    citationsByForeignAuthors: { type: Number, default: 0 },
    citationsByBulgarianAuthors: { type: Number, default: 0 },
    totalCitations: { type: Number, default: 0 },
  },
  Achievements: {
    scientificAchievements: [bilingualSchema],
    professionalAchievements: [bilingualSchema],
    awardsAndHonors: [bilingualSchema],
    reviewerActivity: [bilingualSchema],
    editorialBoardMemberships: [bilingualSchema],
    certificates: [bilingualSchema],
  },
  Contact_Information: {
    phoneNumbers: [String],
    emails: [String],
    personalWebsite: bilingualSchema,
    researchNetworkProfiles: [String],
  },
}, {
  timestamps: true,
  collection: 'professors',
  toJSON: {
    transform(_document, result) {
      if (result.professorLoginAccount) delete result.professorLoginAccount.passwordHash;
      return result;
    },
  },
});

ProfessorSchema.index(
  { 'professorLoginAccount.email': 1 },
  { unique: true, sparse: true },
);

ProfessorSchema.pre('save', async function hashLoginPassword() {
  if (!this.isModified('professorLoginAccount.passwordHash')) return;
  const passwordHash = this.professorLoginAccount && this.professorLoginAccount.passwordHash;
  if (passwordHash) {
    this.professorLoginAccount.passwordHash = await bcrypt.hash(passwordHash, 10);
  }
});

ProfessorSchema.methods.compareLoginPassword = function (candidatePassword) {
  const hash = this.professorLoginAccount && this.professorLoginAccount.passwordHash;
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, hash);
};

module.exports = mongoose.model('Professor', ProfessorSchema);
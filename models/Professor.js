const mongoose = require('mongoose');

const { Schema } = mongoose;

const academicDegreeSchema = new Schema({
  degree: { type: String, default: '' },
  dissertationTitle: { type: String, default: '' },
  dateAcquired: { type: String, default: '' },
  scientificSpecialty: { type: String, default: '' },
}, { _id: false });

const academicTitleSchema = new Schema({
  title: { type: String, default: '' },
  dateAcquired: { type: String, default: '' },
  scientificSpecialty: { type: String, default: '' },
}, { _id: false });

const foreignLanguageSchema = new Schema({
  languageName: { type: String, default: '' },
  readingLevel: { type: String, default: '' },
  writingLevel: { type: String, default: '' },
  speakingLevel: { type: String, default: '' },
}, { _id: false });

const workExperienceSchema = new Schema({
  period: {
    from: { type: String, default: '' },
    to: { type: String, default: '' },
  },
  organization: { type: String, default: '' },
  position: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const programmingLanguageSchema = new Schema({
  language: { type: String, default: '' },
  proficiencyLevel: { type: String, default: '' },
}, { _id: false });

const membershipSchema = new Schema({
  organization: { type: String, default: '' },
  membershipType: { type: String, default: '' },
  period: { type: String, default: '' },
}, { _id: false });

const researchProjectSchema = new Schema({
  projectName: { type: String, default: '' },
  period: { type: String, default: '' },
  fundingOrganization: { type: String, default: '' },
  contractNumber: { type: String, default: '' },
  projectRole: { type: String, default: '' },
}, { _id: false });

const bookSchema = new Schema({
  authors: [String],
  title: { type: String, default: '' },
  publisher: { type: String, default: '' },
  isbn: { type: String, default: '' },
  year: { type: String, default: '' },
  publicationType: { type: String, default: '' },
}, { _id: false });

const publicationSchema = new Schema({
  authors: [String],
  title: { type: String, default: '' },
  publicationOrConference: { type: String, default: '' },
  volume: { type: String, default: '' },
  issue: { type: String, default: '' },
  pages: { type: String, default: '' },
  year: { type: String, default: '' },
  doi: { type: String, default: '' },
  url: { type: String, default: '' },
  pdfFile: { type: String, default: '' },
}, { _id: false });

const ProfessorSchema = new Schema({
  Basic_Information: {
    academicPosition: { type: String, default: '' },
    firstName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    photo: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    placeOfBirth: { type: String, default: '' },
    officeAddress: { type: String, default: '' },
    officeNumber: { type: String, default: '' },
    administrativeFunction: { type: String, default: '' },
  },
  Education: {
    university: { type: String, default: '' },
    major: { type: String, default: '' },
    academicDegrees: [academicDegreeSchema],
    academicTitles: [academicTitleSchema],
    fieldsOfHigherEducation: [String],
    professionalFields: [String],
    researchInterests: [String],
  },
  Teaching_Activity: {
    bachelorsCourses: [String],
    mastersCourses: [String],
    phdCourses: [String],
  },
  Foreign_Languages: [foreignLanguageSchema],
  Work_Experience: [workExperienceSchema],
  Professional_Competences: {
    programmingLanguages: [programmingLanguageSchema],
    technologies: [String],
    platforms: [String],
    frameworks: [String],
    databases: [String],
    otherTechnicalSkills: [String],
  },
  Membership_in_Organizations: [membershipSchema],
  Participation_in_Research_Projects: [researchProjectSchema],
  Publications: {
    summaryIndicators: {
      numberOfScientificArticles: { type: Number, default: 0 },
      numberOfInternationalReports: { type: Number, default: 0 },
      numberOfNationalReports: { type: Number, default: 0 },
    },
    booksAndTextbooks: [bookSchema],
    selectedScientificPublications: [publicationSchema],
  },
  Citations: {
    citationsByForeignAuthors: { type: Number, default: 0 },
    citationsByBulgarianAuthors: { type: Number, default: 0 },
    totalCitations: { type: Number, default: 0 },
  },
  Achievements: {
    scientificAchievements: [String],
    professionalAchievements: [String],
    awardsAndHonors: [String],
    reviewerActivity: [String],
    editorialBoardMemberships: [String],
    certificates: [String],
  },
  Contact_Information: {
    phoneNumbers: [String],
    emails: [String],
    personalWebsite: { type: String, default: '' },
    researchNetworkProfiles: [String],
  },
}, {
  timestamps: true,
  collection: 'professors',
});

module.exports = mongoose.model('Professor', ProfessorSchema);

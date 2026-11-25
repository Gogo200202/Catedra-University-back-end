// Usage:
//   node seed/seedProfessors.js          -> insert/update the 7 dummy professors
//   node seed/seedProfessors.js --reset  -> delete all professors first, then insert

const mongoose = require('mongoose');
const Professor = require('../models/Professor');
const { OFFICE_ADDRESS, professors } = require('./professors.data');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Catedra_University';

const academicPositions = {
  professor: 'Professor',
  assocProfessor: 'Associate Professor',
  chiefAssistant: 'Chief Assistant',
  assistant: 'Assistant',
};

function toProfessorDocument(source) {
  return {
    Basic_Information: {
      academicPosition: academicPositions[source.academicPosition] || source.academicPosition,
      firstName: source.firstName,
      middleName: source.middleName,
      lastName: source.lastName,
      photo: source.photo || '',
      dateOfBirth: source.dateOfBirth || '',
      placeOfBirth: source.placeOfBirth || '',
      officeAddress: OFFICE_ADDRESS,
      officeNumber: source.officeNumber || '',
      administrativeFunction: source.administrativeFunction || '',
    },
    Education: {
      university: source.education.university,
      major: source.education.major,
      academicDegrees: source.education.academicDegrees,
      academicTitles: source.education.academicTitles,
      fieldsOfHigherEducation: source.education.fieldsOfHigherEducation,
      professionalFields: source.education.professionalFields,
      researchInterests: source.education.researchInterests,
    },
    Teaching_Activity: source.teachingActivity,
    Foreign_Languages: source.foreignLanguages,
    Work_Experience: source.workExperience,
    Professional_Competences: source.professionalCompetences,
    Membership_in_Organizations: source.memberships,
    Participation_in_Research_Projects: source.projectParticipations,
    Publications: {
      summaryIndicators: source.publications.summaryIndicators,
      booksAndTextbooks: source.publications.booksAndTextbooks,
      selectedScientificPublications: source.publications.selectedScientificPublications,
    },
    Citations: source.citations,
    Achievements: source.achievements,
    Contact_Information: {
      phoneNumbers: source.contacts.phoneNumbers,
      emails: source.contacts.emails,
      personalWebsite: source.contacts.personalWebsite || '',
      researchNetworkProfiles: source.contacts.researchNetworkProfiles,
    },
  };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (${MONGO_URI})`);

  if (process.argv.includes('--reset')) {
    const { deletedCount } = await Professor.deleteMany({});
    console.log(`Removed ${deletedCount} existing professor(s)`);
  }

  let created = 0;
  let updated = 0;

  for (const source of professors) {
    const document = toProfessorDocument(source);
    const email = source.contacts.emails[0];
    const filter = { 'Contact_Information.emails': email };
    const existed = await Professor.exists(filter);

    await Professor.findOneAndUpdate(filter, document, {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    if (existed) updated += 1;
    else created += 1;
  }

  console.log(`Professors in database: ${await Professor.countDocuments({})}`);
  console.log(`Created: ${created}, updated: ${updated}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

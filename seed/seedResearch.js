// Usage:
//   node seed/seedResearch.js          -> insert/update the 4 projects and 5 publications
//   node seed/seedResearch.js --reset  -> clear both collections first, then insert

const mongoose = require('mongoose');
const ResearchProject = require('../models/ResearchProject');
const Publication = require('../models/Publication');
const { projects, publications } = require('./research.data');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Catedra_University';

const options = {
  upsert: true,
  returnDocument: 'after',
  runValidators: true,
  setDefaultsOnInsert: true,
};

function getByPath(object, path) {
  return path.split('.').reduce((value, key) => (value == null ? value : value[key]), object);
}

async function seedCollection(Model, filterKey, documents) {
  let created = 0;
  let updated = 0;

  for (const document of documents) {
    const keyValue = getByPath(document, filterKey);
    if (keyValue == null) {
      throw new Error(`Missing seed key "${filterKey}" in ${Model.modelName} document`);
    }
    const filter = { [filterKey]: keyValue };
    const existed = await Model.exists(filter);
    await Model.findOneAndUpdate(filter, document, options);

    if (existed) updated += 1;
    else created += 1;
  }

  const total = await Model.countDocuments({});
  console.log(`${Model.modelName}: ${total} in database (created: ${created}, updated: ${updated})`);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (${MONGO_URI})`);

  if (process.argv.includes('--reset')) {
    const projectsResult = await ResearchProject.deleteMany({});
    const publicationsResult = await Publication.deleteMany({});
    console.log(`Removed ${projectsResult.deletedCount} project(s) and ${publicationsResult.deletedCount} publication(s)`);
  }

  await seedCollection(ResearchProject, 'name.en', projects);
  await seedCollection(Publication, 'title', publications);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

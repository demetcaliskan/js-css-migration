// index.js
const { migrateProject } = require('./lib/migrationLogic')

function runMigration(directory) {
  migrateProject(directory)
}

module.exports = {
  runMigration,
}

#!/usr/bin/env node

const { migrateComponentFiles } = require('./lib/migrationLogic')
const yargs = require('yargs')

yargs
  .command(
    'migrate [folder]',
    'Migrate components in a specific folder',
    (yargs) => {
      yargs.positional('folder', {
        describe:
          'Specific folder path (e.g., src/components/ArticleCardComponents)',
        type: 'string',
      })
    },
    (argv) => {
      const folder = argv.folder || 'src/components/*' // Default folder path if not provided
      const errors = migrateComponentFiles(folder)

      if (errors.length > 0) {
        console.log('Components with errors after migration:')
        console.log(errors.join(', '))
      } else {
        console.log(
          'All components in the specified folder migrated successfully.'
        )
      }
    }
  )
  .help().argv

const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { migrateElements } = require('./migrateElements')
const { migrateStyleFile } = require('./migrateStyleFile')
const { migrateIndexFile } = require('./migrateIndexFile')

function migrateComponentFiles(directory) {
  const errorComponents = []

  const componentFolders = glob.sync(path.join(directory, '**', 'index.js'))
  console.log('\ncomponent folders: ', componentFolders)

  componentFolders.forEach((indexFilePath) => {
    console.log('\nstarting with: ', indexFilePath)
    const componentName = path.basename(path.dirname(indexFilePath))
    const stylesFilePath = indexFilePath.replace('index.js', 'styles.js')
    const newStylesFilePath = indexFilePath.replace(
      'index.js',
      'styles.module.css'
    )
    try {
      if (fs.existsSync(stylesFilePath)) {
        const stylesFileContent = fs.readFileSync(stylesFilePath, 'utf-8')
        let importStatements = []
        const { finalStyleFile, styledComponentMap } = migrateStyleFile(
          stylesFileContent,
          importStatements,
          componentName
        )
        fs.writeFileSync(stylesFilePath, finalStyleFile)
        fs.renameSync(stylesFilePath, newStylesFilePath)

        let indexFileContent = fs.readFileSync(indexFilePath, 'utf-8')
        const { indexFile, updatedStyledComponentMap } = migrateIndexFile(
          indexFileContent,
          styledComponentMap,
          stylesFileContent,
          importStatements
        )
        const finalIndexFile = migrateElements(
          indexFile,
          updatedStyledComponentMap
        )
        fs.writeFileSync(indexFilePath, finalIndexFile)
      } else {
        console.log(
          '\nno styles file, migration not required for: ',
          indexFilePath
        )
      }
    } catch (err) {
      console.error(`Error occurred while migrating: ${indexFilePath}`)
      console.error(err)
      errorComponents.push(componentName)
    }
  })
  return errorComponents
}

module.exports = {
  migrateComponentFiles,
}

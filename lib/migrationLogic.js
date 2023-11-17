const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { migrateElements } = require('./migrateElements')

function migrateComponentFiles(directory) {
  console.log('directory', directory)
  const errorComponents = []

  const componentFolders = glob.sync(path.join(directory, 'index.js'))
  console.log('\ncomponent folders: ', componentFolders)
  componentFolders.forEach((indexFilePath) => {
    console.log('\nstarting with: ', indexFilePath)
    const componentName = path.basename(path.dirname(indexFilePath))
    console.log('\ncomponent name: ', componentName)
    const stylesFilePath = indexFilePath.replace('index.js', 'styles.js')
    const newStylesFilePath = indexFilePath.replace(
      'index.js',
      'styles.module.css'
    )
    console.log('\nnew styles file path: ', newStylesFilePath)

    try {
      // 1. Rename styles.js to styles.module.css
      fs.renameSync(stylesFilePath, newStylesFilePath)
      console.log('\n rename susccessfull')

      // 2. Read styles.module.css to get relevant component names and element mappings
      const stylesFileContent = fs.readFileSync(newStylesFilePath, 'utf-8')
      const styledComponents = stylesFileContent.match(
        /export const (.+?) = styled\.(\w+)\`/g
      )

      const defaultRegex = /export default styled\.(\w+)\`/g
      const matchDefault = defaultRegex.exec(stylesFileContent)
      // Mapping styled components to HTML elements
      const styledComponentMap = {}
      styledComponents.forEach((styledComponent) => {
        const matches = styledComponent.match(
          /export const (.+?) = styled\.(\w+)\`/
        )
        if (matches && matches.length === 3) {
          styledComponentMap[matches[1]] = matches[2]
        }
      })

      // 3. Modify index.js

      console.log('\n rename susccessfull')
      let indexFileContent = fs.readFileSync(indexFilePath, 'utf-8')

      const importRegex =
        /import\s+(?:(?:\w+|\{[^}]*\}),?\s*)+\s+from\s+['"]\.[\/\w]+['"];/g
      let modifiedIndexFile = indexFileContent.replace(importRegex, (match) => {
        if (match.includes('./styles')) {
          const defaultExportRegex =
            /import\s+(\w+)((?:|\{[^}]*\}),?\s*)+\s+from\s+['"]\.[\/\w]+['"];/g
          const newMatch = defaultExportRegex.exec(match)
          styledComponentMap[newMatch[1]] = matchDefault[1]
          return "import css from './styles.module.css'"
        } else {
          return match
        }
      })
      migrateElements(indexFilePath, modifiedIndexFile, styledComponentMap)

      console.log(`Successfully migrated: ${indexFilePath}`)
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

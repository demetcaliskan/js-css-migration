const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { migrateElements } = require('./migrateElements')

function migrateComponentFiles(directory) {
  console.log('directory', directory)
  const errorComponents = []

  const componentFolders = glob.sync(path.join(directory, '**/index.js'))
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

      // 2. Read styles.module.css to get relevant component names and element mappings
      let stylesFileContent = fs.readFileSync(stylesFilePath, 'utf-8')
      const styleLineRegex =
        /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`;/g
      const styledComponents = stylesFileContent.match(
        /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
      )

      const newStylesFile = stylesFileContent.replace(
        styleLineRegex,
        (match) => {
          const rege = /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
          const newMatch = rege.exec(match)
          const className = newMatch[1]
          const tagName = newMatch[2]
          const content = newMatch[3]
          const newCSS = `.${className} {
        ${content}
        }`
          return newCSS
        }
      )

      const defaultRegex = /export default styled\.(\w+)\s*`([\s\S]*?)`/g
      const matchDefault = defaultRegex.exec(stylesFileContent)

      const finalStylesFile = newStylesFile.replace(defaultRegex, (match) => {
        const rege = /export default styled\.(\w+)\s*`([\s\S]*?)`/g
        const newMatch = rege.exec(match)
        const className = newMatch[1]
        const content = newMatch[2]
        const newCSS = `.DefaultStyles {
        ${content}
        }`
        return newCSS
      })

      let importStatements = []

      const styleImportRegex = /import\s+.*?['"][^'"]+['"];/g
      let finalFinalStyle = finalStylesFile.replace(
        styleImportRegex,
        (match) => {
          if (match === "import styled from 'styled-components';") {
            return ''
          } else {
            importStatements.push(match)
            return ''
          }
        }
      )

      fs.writeFileSync(stylesFilePath, finalFinalStyle)

      // Mapping styled components to HTML elements
      const styledComponentMap = {}
      styledComponents.forEach((styledComponent) => {
        const rege = /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
        const matches = rege.exec(styledComponent)
        console.log('matches', matches[1])
        if (matches && matches.length === 4) {
          styledComponentMap[matches[1]] = {
            elementName: matches[2],
            content: matches[3],
          }
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
          styledComponentMap[newMatch[1]] = {
            elementName: matchDefault[1],
            content: matchDefault[2],
          }
          let str = "import css from './styles.module.css'"
          if (importStatements.length > 0) {
            importStatements.forEach((element) => {
              str += '\n'
              str += element
            })
          }
          return str
        } else {
          return match
        }
      })

      console.log('styled components map: ', styledComponentMap)

      migrateElements(indexFilePath, modifiedIndexFile, styledComponentMap)

      fs.renameSync(stylesFilePath, newStylesFilePath)
      console.log('\n rename susccessfull')

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

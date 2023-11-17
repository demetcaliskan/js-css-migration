const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { migrateElements } = require('./migrateElements')

function migrateComponentFiles(directory) {
  console.log('directory', directory)
  const errorComponents = []

  const componentFolders = glob.sync(
    path.join(directory, '**/index.js', 'index.js')
  )
  console.log('\ncomponent folders: ', componentFolders)

  componentFolders.forEach((indexFilePath) => {
    console.log('\nstarting with: ', indexFilePath)
    const componentName = path.basename(path.dirname(indexFilePath))
    //console.log('\ncomponent name: ', componentName);
    const stylesFilePath = indexFilePath.replace('index.js', 'styles.js')
    const newStylesFilePath = indexFilePath.replace(
      'index.js',
      'styles.module.css'
    )
    //console.log('\nnew styles file path: ', newStylesFilePath);

    try {
      // 1. Rename styles.js to styles.module.css
      if (fs.existsSync(stylesFilePath)) {
        const stylesFileContent = fs.readFileSync(stylesFilePath, 'utf-8')

        try {
          const styleLineRegex =
            /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`;/g
          const componentRegex =
            /export\s+const\s+(\w+)\s*=\s*styled\([^`]*\)`([\s\S]*?)`;/g

          let beginnerStyleFile = stylesFileContent.replace(
            componentRegex,
            (match) => {
              const rege =
                /export\s+const\s+(\w+)\s*=\s*styled\([^`]*\)`([\s\S]*?)`;/g
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

          let newStylesFile = beginnerStyleFile.replace(
            styleLineRegex,
            (match) => {
              const rege =
                /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
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

          let finalStylesFile = newStylesFile.replace(defaultRegex, (match) => {
            if (match) {
              const rege = /export default styled\.(\w+)\s*`([\s\S]*?)`/g
              const newMatch = rege.exec(match)
              const className = newMatch[1]
              const content = newMatch[2]
              const newCSS = `.DefaultStyles {
              ${content}
              }`
              return newCSS
            }
            return
          })
          const styleImportRegex = /import\s+.*?['"][^'"]+['"];/g
          let finalFinalStyle = finalStylesFile.replace(
            styleImportRegex,
            (match) => {
              let str = ''
              if (match !== "import styled from 'styled-components';") {
                importStatements.push(match)
              }
              return str
            }
          )

          console.log('index file path: ', indexFilePath)
          fs.writeFileSync(stylesFilePath, finalFinalStyle)
          fs.renameSync(stylesFilePath, newStylesFilePath)
        } catch (error) {
          console.log('my error: ', error)
        }

        let importStatements = []

        // Mapping styled components to HTML elements
        const styledComponentMap = {}
        try {
          console.log('styles file content: \n', stylesFileContent)
          const styledComponents = stylesFileContent.match(
            /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
          )
          console.log('styled components: ', styledComponents)
          styledComponents.forEach((styledComponent) => {
            const rege =
              /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
            const matches = rege.exec(styledComponent)
            //console.log('matches', matches[1]);
            if (matches && matches.length === 4) {
              styledComponentMap[matches[1]] = {
                elementName: matches[2],
                content: matches[3],
              }
            }
          })
        } catch (error) {
          console.log('my error: ', error)
        }

        try {
          const styledReactComponents = stylesFileContent.match(
            /export\s+const\s+(\w+)\s*=\s*styled\([^`]*\)`([\s\S]*?)`;/g
          )
          console.log('styled react components: ', styledReactComponents)
          styledReactComponents.forEach((comp) => {
            const rege =
              /export\s+const\s+(\w+)\s*=\s*styled\([^`]*\)`([\s\S]*?)`;/g
            const matches = rege.exec(comp)
            ////console.log('matches', matches[1]);
            if (matches && matches.length === 4) {
              styledComponentMap[matches[1]] = {
                elementName: matches[2],
                content: matches[3],
              }
            }
          })
        } catch (error) {
          console.log('my error: ', error)
        }

        // 3. Modify index.js
        console.log('index file path: ', indexFilePath)
        let indexFileContent = fs.readFileSync(indexFilePath, 'utf-8')
        console.log('index file content', indexFileContent)
        const importRegex =
          /import\s+(?:(?:\w+|\{[^}]*\}),?\s*)+\s+from\s+['"]\.[\/\w]+['"];/g
        const importMatch = indexFileContent.match(importRegex)
        const defaultRegex = /export default styled\.(\w+)\s*`([\s\S]*?)`/g
        const matchDefault = defaultRegex.exec(stylesFileContent)
        console.log('matchhhh', importMatch)
        if (importMatch) {
          try {
            let modifiedIndexFile = indexFileContent.replace(
              importRegex,
              (match) => {
                if (match.includes('./styles')) {
                  const defaultExportRegex =
                    /import\s+(\w+)((?:|\{[^}]*\}),?\s*)+\s+from\s+['"]\.[\/\w]+['"];/g
                  const newMatch = defaultExportRegex.exec(match)
                  if (newMatch) {
                    styledComponentMap[newMatch[1]] = {
                      elementName: matchDefault[1],
                      content: matchDefault[2],
                    }
                  }
                  console.log('new match: ', newMatch)

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
              }
            )
            migrateElements(
              indexFilePath,
              modifiedIndexFile,
              styledComponentMap
            )
          } catch (error) {
            console.log('my error: ', error)
          }
        } else {
          migrateElements(indexFilePath, indexFileContent, styledComponentMap)
        }

        //console.log('styled components map: ', styledComponentMap);

        //console.log(`Successfully migrated: ${indexFilePath}`);
      }
      // 2. Read styles.module.css to get relevant component names and element mappings
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

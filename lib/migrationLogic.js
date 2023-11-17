const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { migrateElements } = require('./migrateElements')

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
      // 1. Rename styles.js to styles.module.css
      if (fs.existsSync(stylesFilePath)) {
        const stylesFileContent = fs.readFileSync(stylesFilePath, 'utf-8')
        let importStatements = []
        try {
          const styleLineRegex =
            /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`;/g
          const componentRegex =
            /export\s+const\s+(\w+)\s*=\s*styled\s*\((\w+)\)`([\s\S]*?)`;/g

          let beginnerStyleFile = stylesFileContent.replace(
            componentRegex,
            (match) => {
              const rege =
                /export\s+const\s+(\w+)\s*=\s*styled\s*\((\w+)\)`([\s\S]*?)`;/g
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

          fs.writeFileSync(stylesFilePath, finalFinalStyle)
          fs.renameSync(stylesFilePath, newStylesFilePath)
        } catch (error) {
          console.log('my error: ', error)
        }

        // Mapping styled components to HTML elements
        const styledComponentMap = {}
        try {
          const styledComponents = stylesFileContent.match(
            /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
          )
          styledComponents.forEach((styledComponent) => {
            const rege =
              /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
            const matches = rege.exec(styledComponent)
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
            /export\s+const\s+(\w+)\s*=\s*styled\s*\((\w+)\)`([\s\S]*?)`;/g
          )
          styledReactComponents.forEach((comp) => {
            const rege =
              /export\s+const\s+(\w+)\s*=\s*styled\s*\((\w+)\)`([\s\S]*?)`;/g
            const matches = rege.exec(comp)
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
        let indexFileContent = fs.readFileSync(indexFilePath, 'utf-8')
        const importRegex =
          /import\s+(?:(?:\w+|\{[^}]*\}),?\s*)+\s+from\s+['"]\.[\/\w]+['"];/g
        const importMatch = indexFileContent.match(importRegex)
        const defaultRegex = /export default styled\.(\w+)\s*`([\s\S]*?)`/g
        const matchDefault = defaultRegex.exec(stylesFileContent)
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

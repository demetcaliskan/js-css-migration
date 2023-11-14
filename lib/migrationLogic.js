const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

function migrateComponentFiles(directory) {
  const errorComponents = []

  const componentFolders = glob.sync(
    path.join(directory, 'components', '*', 'index.js')
  )

  componentFolders.forEach((indexFilePath) => {
    const componentName = path.basename(path.dirname(indexFilePath))
    const stylesFilePath = indexFilePath.replace('index.js', 'styles.js')
    const newStylesFilePath = indexFilePath.replace(
      'index.js',
      'styles.module.css'
    )

    try {
      // 1. Rename styles.js to styles.module.css
      fs.renameSync(stylesFilePath, newStylesFilePath)

      // 2. Read styles.module.css to get relevant component names and element mappings
      const stylesFileContent = fs.readFileSync(newStylesFilePath, 'utf-8')
      const styledComponents = stylesFileContent.match(
        /export const (.+?) = styled\.(\w+);/g
      )

      // Mapping styled components to HTML elements
      const styledComponentMap = {}
      styledComponents.forEach((styledComponent) => {
        const matches = styledComponent.match(
          /export const (.+?) = styled\.(\w+);/
        )
        if (matches && matches.length === 3) {
          styledComponentMap[matches[1]] = matches[2]
        }
      })

      // 3. Modify index.js
      let indexFileContent = fs.readFileSync(indexFilePath, 'utf-8')

      Object.entries(styledComponentMap).forEach(
        ([componentName, elementName]) => {
          const singleTagRegex = new RegExp(`<${componentName}(\\s*?)\/>`, 'g')
          const multipleTagRegex = new RegExp(
            `<${componentName}(\\s*?)><\\/${componentName}>`,
            'g'
          )
          const isMultipleTags = multipleTagRegex.test(indexFileContent)

          if (isMultipleTags) {
            const replacement = `<${elementName}></${elementName}>`
            indexFileContent = indexFileContent.replace(
              multipleTagRegex,
              replacement
            )
          } else {
            const replacement = `<${elementName} />`
            indexFileContent = indexFileContent.replace(
              singleTagRegex,
              replacement
            )
          }
        }
      )

      fs.writeFileSync(indexFilePath, indexFileContent)

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

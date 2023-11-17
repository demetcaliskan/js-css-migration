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
      console.log('styled components map', styledComponentMap)

      // 3. Modify index.js

      console.log('\n rename susccessfull')
      let indexFileContent = fs.readFileSync(indexFilePath, 'utf-8')
      migrateElements(indexFileContent)

      // Object.entries(styledComponentMap).forEach(
      //   ([componentName, elementName]) => {

      //     console.log('component name', componentName)
      //     const regexExp = new RegExp(
      //       `<${componentName}>(\s*<[^>]*>\s*)*(\{[^}]*\})<\/${componentName}>`,
      //       'g'
      //     )
      //     const multipleTagRegex = new RegExp(
      //       `<${componentName}(\\s*?)><\\/${componentName}>`,
      //       'g'
      //     )
      //     const isMultipleTags = multipleTagRegex.test(indexFileContent)
      //     //const reactElementRegex = /<(\w+)[^>]*>([^<]*({.*})?[^<]*)<\/\1>/g;
      //     // const change = indexFileContent.replace(regexExp, `<${elementName}>$2<${elementName}/>`);
      //     // console.log('reactElements', change);

      //     // if (isMultipleTags) {
      //     const replacement = `<${elementName}>$2</${elementName}>`
      //     const newIndexFileContent = indexFileContent.replace(
      //       regexExp,
      //       replacement
      //     )
      //     console.log('updated index.js\n', newIndexFileContent)
      //     fs.writeFileSync(indexFilePath, newIndexFileContent)
      //     // } else {
      //     //   const replacement = `<${elementName} />`;
      //     //   indexFileContent = indexFileContent.replace(singleTagRegex, replacement);
      //     // }
      //   }
      // )

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

const fs = require('fs-extra')

function migrateElements(indexFilePath, indexFile, styledComponentMap) {
  const openingTagRegex = /<(\w+)([^>]*)>/g
  const closingTagRegex = /<\/(\w+)([^>]*)>/g
  Object.entries(styledComponentMap).forEach(
    ([inputComponentName, { elementName, content }]) => {
      const modifiedJSX = indexFile
        .replace(openingTagRegex, (match, componentName, attributes) => {
          if (inputComponentName === 'DefaultStyledComponent') {
            return `<${elementName} className={css.DefaultStyles} ${attributes}>`
          }
          if (componentName === inputComponentName) {
            return `<${elementName} className={css.${componentName}} ${attributes}>`
          }
          return match
        })
        .replace(closingTagRegex, (match, componentName, attributes) => {
          if (inputComponentName === 'DefaultStyledComponent') {
            return `</${elementName}>`
          }
          if (componentName === inputComponentName) {
            return `</${elementName}${attributes}>`
          }
          return match
        })
      indexFile = modifiedJSX
    }
  )
  fs.writeFileSync(indexFilePath, indexFile)
}

// `transformedCode.code` now contains the modified JSX code

module.exports = {
  migrateElements,
}

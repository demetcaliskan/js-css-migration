function migrateElements(indexFile, styledComponentMap) {
  const openingTagRegex = /<(\w+)([^>]*)>/g
  const closingTagRegex = /<\/(\w+)([^>]*)>/g
  Object.entries(styledComponentMap).forEach(
    ([inputComponentName, { elementName, content }]) => {
      const modifiedJSX = indexFile
        .replace(openingTagRegex, (match, componentName, attributes) => {
          if (componentName === inputComponentName) {
            return `<${elementName} className={css.${componentName}} ${attributes}>`
          }
          return match
        })
        .replace(closingTagRegex, (match, componentName, attributes) => {
          if (componentName === inputComponentName) {
            return `</${elementName}${attributes}>`
          }
          return match
        })
      indexFile = modifiedJSX
    }
  )
  return indexFile
}

module.exports = {
  migrateElements,
}

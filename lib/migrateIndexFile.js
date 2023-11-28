function migrateIndexFile(indexFileContent, styledComponentMap) {
  const importRegex =
    /import\s+(?:(?:\w+|\{[^}]*\}),?\s*)+\s+from\s+['"]\.[\/\w]+['"];/g
  const importMatch = indexFileContent.match(importRegex)
  const defaultRegex = /export default styled\.(\w+)\s*`([\s\S]*?)`/g
  const defaultExportComponentRegex =
    /export default styled\((\w+)\)`([\s\S]*?)`/g
  const matchDefault = defaultRegex.exec(stylesFileContent)
  const matchDefaultComponent =
    defaultExportComponentRegex.exec(stylesFileContent)
  if (importMatch) {
    try {
      let modifiedIndexFile = indexFileContent.replace(importRegex, (match) => {
        if (match.includes('./styles')) {
          const defaultExportRegex =
            /import\s+(\w+)((?:|\{[^}]*\}),?\s*)+\s+from\s+['"]\.[\/\w]+['"];/g
          const newMatch = defaultExportRegex.exec(match)
          if (newMatch && matchDefault) {
            styledComponentMap[newMatch[1]] = {
              elementName: matchDefault[1],
              content: matchDefault[2],
            }
          } else if (newMatch && matchDefaultComponent) {
            styledComponentMap[newMatch[1]] = {
              elementName: matchDefaultComponent[1],
              content: matchDefaultComponent[2],
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
      })
      return {
        indexFile: modifiedIndexFile,
        updatedStyledComponentMap: styledComponentMap,
      }
    } catch (error) {
      console.log('my error: ', error)
    }
  } else {
    return {
      indexFile: indexFileContent,
      updatedStyledComponentMap: styledComponentMap,
    }
  }
}

module.exports = { migrateIndexFile }

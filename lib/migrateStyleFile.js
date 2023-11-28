function migrateStyleFile(stylesFileContent, importStatements) {
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

    let newStylesFile = beginnerStyleFile.replace(styleLineRegex, (match) => {
      const rege = /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
      const newMatch = rege.exec(match)
      const className = newMatch[1]
      const tagName = newMatch[2]
      const content = newMatch[3]
      const newCSS = `.${className} {
          ${content}
          }`
      return newCSS
    })

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

    const defaultExportComponentRegex =
      /export default styled\((\w+)\)`([\s\S]*?)`/g
    let defaultExportStyleSheet = finalStylesFile.replace(
      defaultExportComponentRegex,
      (match) => {
        const rege = /export default styled\((\w+)\)`([\s\S]*?)`/g
        const newMatch = rege.exec(match)
        const className = `${componentName}Styles`
        const tagName = newMatch[1]
        const content = newMatch[2]
        const newCSS = `.${className} {${content}}`
        return newCSS
      }
    )

    const styleImportRegex = /import\s+.*?['"][^'"]+['"];/g
    let finalFinalStyle = defaultExportStyleSheet.replace(
      styleImportRegex,
      (match) => {
        let str = ''
        if (match !== "import styled from 'styled-components';") {
          importStatements.push(match)
        }
        return str
      }
    )
  } catch (error) {
    console.log('my error: ', error)
  }

  // Mapping styled components to HTML elements
  let styledComponentMap = {}
  try {
    const styledComponents = stylesFileContent.match(
      /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
    )
    styledComponents.forEach((styledComponent) => {
      const rege = /export const (\w+)\s*=\s*styled\.(\w+)\s*`([\s\S]*?)`/g
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
  return { finalFinalStyle, styledComponentMap }
}

module.exports = { migrateStyleFile }

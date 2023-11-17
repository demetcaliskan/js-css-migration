const babel = require('@babel/core')

function migrateElements(indexFile) {
  const transformedCode = babel.transform(indexFile, {
    presets: ['@babel/preset-react'],
    plugins: [
      {
        visitor: {
          JSXElement(path) {
            // This function gets called for each JSX element found
            const { node } = path
            // You can access and manipulate the JSX node here
            console.log('Found JSX element:', node.openingElement.name.name)
          },
          // You can add more visitors for other types of nodes (JSXExpression, etc.)
        },
      },
    ],
  })
  console.log('transformed code: \n', transformedCode.code)
}

// `transformedCode.code` now contains the modified JSX code

module.exports = {
  migrateElements,
}

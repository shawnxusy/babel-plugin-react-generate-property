const { declare } = require('@babel/helper-plugin-utils')
const { types: t } = require('@babel/core')

module.exports = declare(api => {
  api.assertVersion(7)

  return {
    //  name: 'react-generate-data-id',
    visitor: {
      Program(programPath, state) {
        // Get user configs
        const {
          customProperty = 'data-id',
          slashChar = '/',
          dirLevel = 1,
          addClassNames = false
        } = state.opts

        console.log(state)

        const filename = state.file.opts.filename || '' // filename missing in test env

        const splits = filename.split(slashChar)
        if (!splits || !splits.length) {
          console.error(
            'babel-plugin-react-generate-property plugin error: File path is not valid. If you are on Windows, you might need to specify backslash as slashChar in options.'
          )
          return
        }

        const dirNames = splits.slice(-1 - dirLevel, -1)

        const fileName = splits[splits.length - 1].split('.')[0]
        const fileIdentifier = `${dirNames.join('_')}_${fileName}`
        let previousNodeName = ''
        let index = 0

        programPath.traverse({
          JSXElement(jsxPath) {
            let nodeName = '',
              className = '',
              dataIDDefined = false

            if (addClassNames) {
              const classNodes = jsxPath.node.openingElement.attributes.filter(
                x => x?.name?.name == 'className'
              )
              const classNames = classNodes
                .map(x => x?.value?.expression?.property?.name)
                .filter(Boolean)
              className = classNames.length > 0 ? classNames.join('_') : ''
            }

            // Traverse once to get the element node name (div, Header, span, etc)
            jsxPath.traverse({
              JSXOpeningElement(openingPath) {
                openingPath.stop() // Do not visit child nodes again
                const identifierNode = openingPath.get('name').node
                nodeName = identifierNode.name

                openingPath.traverse({
                  JSXAttribute(attributePath) {
                    // If the data attribute doesn't exist, then we append the data attribute
                    const attributeName = attributePath.get('name').node.name
                    if (!dataIDDefined) {
                      dataIDDefined = attributeName === customProperty
                    }
                  }
                })
              }
            })

            if (!dataIDDefined && nodeName && nodeName !== 'Fragment') {
              jsxPath.node.openingElement.attributes.push(
                t.jSXAttribute(
                  t.jSXIdentifier(customProperty),
                  t.stringLiteral(
                    `${nameGenerator(fileIdentifier, nodeName)}${
                      nameGenerator(fileIdentifier, previousNodeName) ===
                      nameGenerator(fileIdentifier, nodeName)
                        ? `_${index}`
                        : ''
                    }${
                      addClassNames && className.length > 0
                        ? `_${className}`
                        : ''
                    }`
                  )
                )
              )
              previousNodeName = nodeName
              if (previousNodeName === nodeName) {
                index++
              } else {
                index = 0
              }
            }
          }
        })
      }
    }
  }
})

function nameGenerator(path, name) {
  return `${path}_${name}`
}

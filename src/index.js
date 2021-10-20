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
          addModuleClassNames = false,
          prefix = '',
          ignoreTreeDepth = false,
          ignoreNodeNames = false,
          firstChildOnly = false,
          match = null
        } = state.opts

        const filename = state.file.opts.filename || '' // filename missing in test env, see tests

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

            // we traverse to find css module classes names, works like:
            // `<div className={s.foo}>` -> `foo`
            if (addModuleClassNames) {
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

            // Detect if parent is React component or DOM node
            // Option adds attrs to first DOM node in the component
            // and ignores inner nodes
            const firstChild = firstChildOnly
              ? !previousNodeName || startsFromUpperCase(previousNodeName)
              : true

            // option to append data-attrs only to certain components
            // matches filename/filepath by RegExp
            const filter = match ? match.test(filename) : true

            if (!dataIDDefined && nodeName && nodeName !== 'Fragment') {
              const params = {
                path: fileIdentifier,
                nodeName,
                previousNodeName,
                index,
                className
              }

              firstChild &&
                filter &&
                jsxPath.node.openingElement.attributes.push(
                  t.jSXAttribute(
                    t.jSXIdentifier(customProperty),
                    t.stringLiteral(nameGenerator(params, state.opts))
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

function nameGenerator(params, options) {
  const prefix = options.prefix || null
  const path = params.path || null
  const nodeName = options.ignoreNodeNames ? null : params.nodeName || null

  const index =
    params.nodeName == params.previousNodeName && !options.ignoreTreeDepth
      ? params.index
      : null

  const className =
    options.addModuleClassNames && params.className.length > 0
      ? params.className
      : null

  return [prefix, path, nodeName, index, className].filter(Boolean).join('_')
}

function startsFromUpperCase(s) {
  if (s.length == 0) {
    return false
  }
  return s[0].toUpperCase() == s[0]
}

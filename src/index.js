module.exports = function({ types: t }) {
  return {
    visitor: {
      Program(programPath, state) {
        // Get user configs
        const {
          customProperty = "data-id",
          slashChar = "/",
          dirLevel = 1
        } = state.opts;
        const filename = state.file.opts.filename;

        const splits = filename.split(slashChar);
        if (!splits || !splits.length) {
          console.error(
            "babel-plugin-react-generate-property plugin error: File path is not valid. If you are on Windows, you might need to specify backslash as slashChar in options."
          );
          return;
        }

        const dirNames = splits.slice(-1 - dirLevel, -1);

        const fileName = splits[splits.length - 1].split(".")[0];
        const fileIdentifier = `${dirNames.join("_")}_${fileName}`;

        programPath.traverse({
          JSXElement(jsxPath) {
            let nodeName = "",
              dataIDDefined = false;

            // Traverse once to get the element node name (div, Header, span, etc)
            jsxPath.traverse({
              JSXOpeningElement(openingPath) {
                openingPath.stop(); // Do not visit child nodes again
                const identifierNode = openingPath.get("name").node;
                nodeName = identifierNode.name;
                openingPath.traverse({
                  JSXAttribute(attributePath) {
                    // If the data attribute doesn't exist, then we append the data attribute
                    const attributeName = attributePath.get("name").node.name;
                    if (!dataIDDefined) {
                      dataIDDefined = attributeName === customProperty;
                    }
                  }
                });
              }
            });

            if (!dataIDDefined && nodeName && nodeName !== 'Fragment') {
              jsxPath.node.openingElement.attributes.push(
                t.jSXAttribute(
                  t.jSXIdentifier(customProperty),
                  t.stringLiteral(`${fileIdentifier}_${nodeName}`)
                )
              );
            }
          }
        });
      }
    }
  };
};

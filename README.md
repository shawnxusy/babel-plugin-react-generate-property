# babel-plugin-react-generate-property

## Overview 
A plugin to automatically generate and add properties (for example data attributes) for all JSX open tags, especially styled components (Emotion, Styled Components, etc).
This is useful for a couple places:
- End to End test, if you don't want to manually add data attributes or classnames to all tags.
- Third party usage tracking tools like Heap, where they can pick up data attributes.

## Before
```jsx
// src/client/Components/Common/Header.jsx
<View>
  <Logo>...</Logo>
  <Content>...</Content>
</View>

const View = styled('div')(...);
const Logo = styled('div')(...);
const Content = styled('div')(...);
```

## Generated
```jsx
// src/client/Components/Common/Header.jsx
// using options (customProperty: 'data-test', dirLevel: 1)
<View data-test="Common_Header_View">
  <Logo data-test="Common_Header_Logo">...</Logo>
  <Content data-test="Common_Header_Content">...</Content>
</View>

const View = styled('div')(...);
const Logo = styled('div')(...);
const Content = styled('div')(...);
```

## Installation
Available on npm as [babel-plugin-react-generate-property](https://www.npmjs.com/package/babel-plugin-react-generate-property).

To install the latest stable version with Yarn:

```sh
$ yarn add --dev babel-plugin-react-generate-property
```

...or with npm:

```sh
$ npm install --save-dev babel-plugin-react-generate-property
```

## Usage (via .babelrc)
```json
// .babelrc

{
  "env": {
    "development": {
      "plugins": ["react-generate-data-id"]
    }
  }
}
```

## Custom options
```json
// .babelrc
{
  "env": {
    "development": {
      "plugins": [["react-generate-data-id", { "customProperty": "data-dev", "dirLevel": 2, "slashChar": "\" }]]
    }
  }
}
```
**customProperty** Use this to configure which property to add to open tags. By default it would be "data-id".

**dirLevel** How many levels of the file directory do you want to use for the property value. If you use more, the generated value is more likely to be unique, but you will also incur slightly larger builds. Default to 1 (append only the directory where the target file is located in)

**slashChar** Default to "/", if you are on Windows, use "\".


## Via CLI

```sh
babel --plugins react-generate-data-id script.js
```

## Via Node API

without options:

```js
require('babel-core').transform('code', {
  plugins: ['react-generate-data-id'],
});
```

with options:

```js
require('babel-core').transform('code', {
  plugins: [['react-generate-data-id', { customProperty: 'data-test' }]],
});
```

## Contributing
This library gets reference and inspiration from https://github.com/alanbsmith/babel-plugin-react-add-property/blob/master/README.md, all requests and comments are welcome.

## License

[MIT][license]

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
      "plugins": ["babel-plugin-react-generate-property"]
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
      "plugins": [
        [
          "babel-plugin-react-generate-property", {
            "customProperty": "data-dev",
            "dirLevel": 2,
            "slashChar": "\",
            "addModuleClassNames": true,
            "prefix": "myPrefix",
            "firstChildOnly": false
          }
        ]
      ]
    }
  }
}
```
**customProperty**: Use this to configure which property to add to open tags. By default it would be "data-id".

**customSeparator**: Use this to configure the separator used between generated property value, for example, setting it to "-" would yield something like `<div data-id="Common-Header-div-wrapper" />`. By default it would be "_".

**dirLevel**: How many levels of the file directory do you want to use for the property value. If you use more, the generated value is more likely to be unique, but you will also incur slightly larger builds. Default to 1 (append only the directory where the target file is located in). 

You may also set dirLevel to a negative value, in which case, the plugin will strip the first `-dirLevel` directory values from the beginning, instead of keeping values from the end.

<details>
<summary>Negative dirLevel example</summary>

Let's say the file to be processed has a relative path of `/src/client/pages/common/tables/MyCustomTable.jsx`.

And the file has content of:
```jsx
<View>
  ...
</View>
```

Now if we pass in `dirLevel: 2`, the generated data id would look like:
```jsx
<View data-id="common_tables_MyCustomTable_View">
  ...
</View>
```

But if `dirLevel: -2` is passed, the plugin would strip relative path from the beginning, and generate something like:
```jsx
<View data-id="client_pages_common_tables_MyCustomTable_View">
  ...
</View>
```

Note that a dirLevel value of `-2` essentially stripped off both the rootDir, and then the `src/` part of the relative path.

</details>

**omitFileName**  (default: `false`): In case you want to omit filename in data-attr

**slashChar**: Default to "/", if you are on Windows, use "\".

**addModuleClassNames**  (default: `false`) : In case you use css-modules and want to add className to data-attribute:

#### Before
```jsx
// src/client/Components/Common/Header.jsx
<View>
  <div className={s.wrapper}>...</div>
</View>
```

#### Generated
```jsx
// using option (addModuleClassNames: true)
<View data-test="Common_Header_View">
  <div className={s.wrapper} data-test="Common_Header_div_wrapper">...</div>
</View>
```

This does not work for basic string classNames

**prefix**: Add custom prefix to data-attr

**ignoreNodeNames**: do not add nodeName to data-attr (default: `false`) 

**match**: Accepts RegExp matching filepath and filename. Attrs will be added to matched components only. Matched regex string will be added as prefix. Only suitable for js-forms of babel config.

**firstChildOnly**: Adds test attrs only on the root DOM node of every component  (default: `false`) 


<details>
<summary>firstChildOnly feature details</summary>

In general it should work as follows:

```jsx
const A = (props) => <main>{props.children}</main>
const B = (props) => <figure /><div>{props.children}<span/></div>

<A><B>Hello</B></A>
```

will be transformed into

```html
<main data-id="prefix_main">
  <figure data-id="prefix_figure"></figure>
  <div>Hello<span></span></div>
</main>
```
The problem behind this feature is: 

- we want to add automated data-attrs and use them in stage environment 
- but stage and production builds use the same docker-image, and there is valid CI logic behind that
- we can detect staging env in runtime, but we can not do so while building
- so we are stuck to keeping attributes in production
- at least we want to keep the gentle minimum for QA, 1 attr per component is enough

Components can be defined in this ways:

```jsx
const Foo = (props) => <main><div>{whatever}<div/><etc /></main>
```

In such case `<main>` will be marked, child DOM nodes will not, until next React component will be met


```jsx
const Foo = (props) => <Wrapper><div>{whatever}</div><etc /></Wrapper>
```

In such case `<div>` will be marked, next DOM nodes in the wrapper will not (gentle minimum)

```jsx
const Foo = (props) => <><div>{whatever}</div><etc /></>
```

In such case `<div>` should be marked by design, next DOM nodes in the Fragment should not. **Actual behaviour with Fragments is unstable for now, not working as intended in some cases.**


</details>


## Via CLI

```sh
babel --plugins babel-plugin-react-generate-property script.js
```

## Via Node API

without options:

```js
require('@babel/core').transformSync('code', {
  plugins: [require('babel-plugin-react-generate-property')],
});
```

with options:

```js
require('babel-core').transformSync('code', {
  plugins: [
    [
      require('babel-plugin-react-generate-property'),
      { customProperty: 'data-test' }
    ]
  ],
});
```

## Contributing
This library gets reference and inspiration from https://github.com/alanbsmith/babel-plugin-react-add-property/blob/master/README.md, all requests and comments are welcome.

## License

[MIT][license]

const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval

const ex1 = `<div><div/></div>`

const ex2 = `let App = (props) => <div>{props.children}</div>; <App><div></div></App>`

const ex1b = babel.transformSync(ex1, {
  presets: ['@babel/preset-react'],
  plugins: [plugin]
})

const ex2b = babel.transformSync(ex2, {
  presets: ['@babel/preset-react'],
  plugins: [plugin]
})

const ex3b = babel.transformSync(ex2, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin]]
})

const ex4b = babel.transformSync(ex2, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { dirLevel: 0 }]]
})

const ex5b = babel.transformSync(ex2, {
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { customProperty: 'data-test-element' }]]
})

const ex6b = babel.transformSync(ex2, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { customSeparator: '-' }]]
})

const ex7b = babel.transformSync(ex2, {
  filename: 'my/deep/custom/dir/fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { dirLevel: 2 }]]
})

const ex8b = babel.transformSync(ex2, {
  filename: 'my/deep/custom/dir/fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { dirLevel: -2 }]]
})

const ex9b = babel.transformSync(ex2, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { dirLevel: -2 }]]
})

describe('Basic functionality', () => {
  describe('DOM node name', function () {
    it('should be read', function () {
      const output = eval(ex1b.code)
      assert.equal(output.props['data-id'], '__div')
    })
  })

  describe('React node name', function () {
    it('should be read', function () {
      const output = eval(ex2b.code)
      assert.equal(output.props['data-id'], '__App')
    })
  })

  describe('Index', function () {
    it('should be count and put into the tree', function () {
      const output = eval(ex1b.code)
      assert.equal(output.props.children.props['data-id'], '__div_1')
    })

    it('should not be count in case of different nodes', function () {
      const output = eval(ex2b.code)
      assert.equal(output.props.children.props['data-id'], '__div')
    })
  })

  describe('Dirname', function () {
    it('should be read', function () {
      const output = eval(ex3b.code)
      assert.equal(
        output.props['data-id'],
        'babel-plugin-react-generate-property_fname_App' // asserting you just clone repo with this name
      )
    })

    it('should be ignored in case of dirLevel 0', function () {
      const output = eval(ex4b.code)
      assert.equal(output.props['data-id'], '_fname_App')
    })
  })

  describe('Custom property', function () {
    it('should be custom', function () {
      const output = eval(ex5b.code)
      assert.equal(output.props['data-test-element'], '__App')
    })
  })

  describe('Custom separator', function () {
    it('should be custom', function () {
      const output = eval(ex6b.code)
      assert.equal(
        output.props['data-id'],
        'babel-plugin-react-generate-property-fname-App'
      )
    })
  })

  describe('Directory level', function () {
    it('should accept dirLevel of greater than 1', function () {
      const output = eval(ex7b.code)
      assert.equal(output.props['data-id'], 'custom_dir_fname_App')
    })

    it('should accept negative dirLevel', function () {
      const output = eval(ex8b.code)
      assert.equal(output.props['data-id'], 'deep_custom_dir_fname_App')
    })

    it('should accept negative dirLevel and shallow file path', function () {
      const output = eval(ex9b.code)
      assert.equal(output.props['data-id'], '_fname_App')
    })
  })
})

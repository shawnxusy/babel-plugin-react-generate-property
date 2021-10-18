const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval

const ex1 = `<div><div></div></div>`

const ex2 = `let App = (p) => <div>{props.children}</div>; <App><div></div></App>`

const ex1b = babel.transformSync(ex1, {
  presets: ['@babel/preset-react'],
  plugins: [plugin]
})

const ex2b = babel.transformSync(ex2, {
  presets: ['@babel/preset-react'],
  plugins: [plugin]
})

describe('Basic functionality', () => {
  describe('DOM node name', function() {
    it('should be read', function() {
      const output = eval(ex1b.code)
      assert.equal(output.props['data-id'], '__div')
    })
  })

  describe('React node name', function() {
    it('should be read', function() {
      const output = eval(ex2b.code)
      assert.equal(output.props['data-id'], '__App')
    })
  })

  describe('index', function() {
    it('should be count and put into the tree', function() {
      const output = eval(ex1b.code)
      assert.equal(output.props.children.props['data-id'], '__div_1')
    })

    it('should not be count in case of different nodes', function() {
      const output = eval(ex2b.code)
      assert.equal(output.props.children.props['data-id'], '__div')
    })
  })
})

const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval

const ex1 = `<div><div></div></div>`

const a = babel.transformSync(ex1, {
  presets: ['@babel/preset-react'],
  plugins: [plugin]
})

describe('Basic functionality', () => {
  describe('node name', function() {
    it('should be read', function() {
      const output = eval(a.code)
      assert.equal(output.props['data-id'], '__div')
      assert.equal(output.props.children.props['data-id'], '__div_1')
    })
  })

  describe('index', function() {
    it('should be count and put into the tree', function() {
      const output = eval(a.code)
      assert.equal(output.props.children.props['data-id'], '__div_1')
    })
  })
})

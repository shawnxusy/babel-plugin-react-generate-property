const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval

const ex1 = `let App = (props) => <div>{props.children}</div>; <App><div className='testclass'></div></App>`

const ex2 = `let s = {}; <div className={s.testClassName}></div>`

const ex3 = `<div><div /></div>`

const ex1b = babel.transformSync(ex1, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { prefix: 'testprefix', dirLevel: 0 }]]
})

const ex1b2 = babel.transformSync(ex1, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { ignoreNodeNames: true, dirLevel: 0 }]]
})

const ex1b3 = babel.transformSync(ex1, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { omitFileName: true, dirLevel: 0 }]]
})

const ex2b = babel.transformSync(ex2, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { addModuleClassNames: true, dirLevel: 0 }]]
})

const ex3b = babel.transformSync(ex3, {
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { ignoreTreeDepth: true }]]
})

describe('Options functionality', () => {
  describe('Prefix', function() {
    it('should be passed', function() {
      const output = eval(ex1b.code)
      assert.equal(output.props['data-id'], 'testprefix__fname_App')
    })
  })

  describe('Module Classnames', function() {
    it('should be passed', function() {
      const output = eval(ex2b.code)
      assert.equal(output.props['data-id'], '_fname_div_testClassName')
    })
  })

  describe('ignoreTreeDepth option', function() {
    it('should ignore inner index', function() {
      const output = eval(ex3b.code)
      assert.equal(output.props.children.props['data-id'], '__div')
    })
  })

  describe('ignoreNodeNames option', function() {
    it('should ignore node name', function() {
      const output = eval(ex1b2.code)
      assert.equal(output.props.children.props['data-id'], '_fname')
    })
  })

  describe('omitFileName option', function() {
    it('should ignore node name', function() {
      const output = eval(ex1b3.code)
      assert.equal(output.props.children.props['data-id'], 'div')
    })
  })
})

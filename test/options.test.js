const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval

const ex1 = `let App = (props) => <div>{props.children}</div>; <App><div className='testclass'></div></App>`

const ex2 = `let s = {}; <div className={s.testClassName}></div>`

const ex3 = `<div><div /></div>`

const ex4 = `let App = (props) => <div>{props.children}</div>; <App><div><span/></div></App>`

const ex1b = babel.transformSync(ex1, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { prefix: 'testprefix', dirLevel: 0 }]]
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

const ex4b = babel.transformSync(ex4, {
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { firstChildOnly: true }]]
})

const ex5b = babel.transformSync(ex1, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { match: /fname/ }]]
})

const ex6b = babel.transformSync(ex1, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { match: /notfound/ }]]
})

const ex7b = babel.transformSync(ex1, {
  filename: 'fname.js',
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { match: /babel/ }]] // considering git clone 'bablel-plugin-...'
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

  describe('firstChildOnly option', function() {
    it('should not add data-id on component', function() {
      const output = eval(ex4b.code)
      assert.equal(output.props['data-id'], undefined)
    })

    it('should add data-id on first node in container', function() {
      const output = eval(ex4b.code)
      assert.equal(output.props.children.props['data-id'], '__div')
    })

    it('should not add data-id on inner nodes', function() {
      const output = eval(ex4b.code)
      assert.equal(
        output.props.children.props.children.props['data-id'],
        undefined
      )
    })
  })

  describe('match option', function() {
    it('should add data-id on matching component (filename)', function() {
      const output = eval(ex5b.code)
      assert.notEqual(output.props['data-id'], undefined)
      assert.notEqual(output.props.children.props['data-id'], undefined)
    })

    it('should add data-id on matching component (dirname)', function() {
      const output = eval(ex7b.code)
      assert.notEqual(output.props['data-id'], undefined)
      assert.notEqual(output.props.children.props['data-id'], undefined)
    })

    it('should not add data-id on non-matching component', function() {
      const output = eval(ex6b.code)
      assert.equal(output.props['data-id'], undefined)
    })
  })
})

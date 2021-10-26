const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval

describe('match option', function() {
  const code = `let App = (props) => <div>{props.children}</div>; <App><div className='testclass'></div></App>`

  const correctMatchOutput = babel.transformSync(code, {
    filename: 'fname.js',
    presets: ['@babel/preset-react'],
    plugins: [[plugin, { match: /fnam/ }]]
  })

  const incorrectMatchOutput = babel.transformSync(code, {
    filename: 'fname.js',
    presets: ['@babel/preset-react'],
    plugins: [[plugin, { match: /notfound/ }]]
  })

  const dirnameMatchOutput = babel.transformSync(code, {
    filename: 'fname.js',
    presets: ['@babel/preset-react'],
    plugins: [[plugin, { match: /babel/ }]] // considering git clone 'bablel-plugin-...'
  })

  describe('Basic behavior', function() {
    it('should add data-id on matching component (filename)', function() {
      const output = eval(correctMatchOutput.code)
      assert.notEqual(output.props['data-id'], undefined)
      assert.notEqual(output.props.children.props['data-id'], undefined)
    })

    it('should add data-id on matching component (dirname)', function() {
      const output = eval(dirnameMatchOutput.code)
      assert.notEqual(output.props['data-id'], undefined)
      assert.notEqual(output.props.children.props['data-id'], undefined)
    })

    it('should add correct regex prefix', function() {
      const output = eval(correctMatchOutput.code)
      assert.equal(output.props['data-id'].startsWith('fnam_'), true)
    })

    it('should not add data-id on non-matching component', function() {
      const output = eval(incorrectMatchOutput.code)
      assert.equal(output.props['data-id'], undefined)
    })
  })
})

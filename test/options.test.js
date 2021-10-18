const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval

const ex1 = `let App = (p) => <div>{props.children}</div>; <App><div className='testclass'></div></App>`

const ex2 = `let s = {}; <div className={s.testClassName}></div>`

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
})

const assert = require('assert')
const babel = require('@babel/core')
const plugin = require('../src/index.js')

const React = require('react') // used in eval
const RD = require('react-dom/server')

describe('firstChildOnly option', function() {
  describe('Trivial cases', function() {
    const code = `<div><div /></div>`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true }]]
    })

    it('should add data-id on the only node in container', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props['data-id'], '__div')
    })
  })

  describe('Basic cases', function() {
    const code = `let App = (props) => <div>{props.children}</div>; <App><div><span/></div></App>`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true }]]
    })

    it('should add data-id on first child in container', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props.children.props['data-id'], '__div')
    })

    it('should not add data-id on inner nodes of the only node', function() {
      const output = eval(babelOutput.code)
      assert.equal(
        output.props.children.props.children.props['data-id'],
        undefined
      )
    })
    it('should not add data-id on component', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props['data-id'], undefined)
    })
  })

  describe('several nodes as children', function() {
    const code = `let App = (props) => <div>{props.children}</div>; <App><div /><div /></App>`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true, dirLevel: 0 }]]
    })
    it('should add data-id on first child in container', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props.children[0].props['data-id'], '__div')
    })

    it('should not add data-id on the second child in container', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props.children[1].props['data-id'], undefined)
    })
  })

  describe('Fragment behavior', function() {
    const code = `<><div /><div /></>`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true, dirLevel: 0 }]]
    })

    it('should add data-id on first child of a fragment', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props.children[0].props['data-id'], '__div')
    })

    it('should not add data-id on second child of a fragment', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props.children[1].props['data-id'], undefined)
    })
  })

  describe('Complex cases', function() {
    const code = `
      let App = (props) => <div>{props.children}</div>;
      let RC = (props) => <figure />;
      <App><div /><div /><RC/><div /><div /></App>`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true, dirLevel: 0 }]]
    })

    it('should not add data-id on non-first element following component', function() {
      const output = eval(babelOutput.code)
      assert.equal(output.props.children[3].props['data-id'], undefined)
    })
  })
})

describe('firstChildOnly examples', function() {
  describe('Readme example', function() {
    const code = `
        const A = (props) => <main>{props.children}</main>;
        const B = (props) => <A><figure /><div>{props.children}<span/></div></A>;
        RD.renderToStaticMarkup(<B>Hello</B>)`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true, dirLevel: 0 }]]
    })

    it('should match snapshot', function() {
      const output = eval(babelOutput.code)

      assert.equal(
        output,
        '<main data-id="__main"><figure data-id="__figure"></figure><div>Hello<span></span></div></main>'
      )
    })
  })

  describe('Fragment example', function() {
    const code = `
        const B = (props) => <><figure /><div>{props.children}<span/></div></>;
        RD.renderToStaticMarkup(<B>Hello</B>)`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true, dirLevel: 0 }]]
    })

    it('should match snapshot', function() {
      const output = eval(babelOutput.code)

      assert.equal(
        output,
        '<figure data-id="__figure"></figure><div>Hello<span></span></div>'
      )
    })
  })

  describe('Inner Fragment actual behavior example (is ignored)', function() {
    const code = `
        const A = (props) => <><main>{props.children}</main></>;
        const B = (props) => <><figure /><div>{props.children}<span/></div></>;
        RD.renderToStaticMarkup(<A><B>Hello</B></A>)
  `

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true, dirLevel: 0 }]]
    })

    it('should match snapshot', function() {
      const output = eval(babelOutput.code)

      assert.equal(
        output,
        '<main data-id="__main"><figure></figure><div>Hello<span></span></div></main>'
      )
    })
  })

  describe('Inner Fragment actual behaviour example', function() {
    const code = `
      const A = (props) => <main>{props.children}</main>;
      RD.renderToStaticMarkup(<A><><figure /><div>Hello<span/></div></></A>)
`

    const babelOutput = babel.transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [[plugin, { firstChildOnly: true, dirLevel: 0 }]]
    })

    it('should match snapshot', function() {
      const output = eval(babelOutput.code)
      assert.equal(
        output,
        '<main data-id="__main"><figure></figure><div>Hello<span></span></div></main>'
      )
    })
  })
})

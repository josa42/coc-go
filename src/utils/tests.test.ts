import assert from 'assert'
import { extractFunctionName } from './tests'

describe('extractFunctionName()', () => {
  const cases = [
    ['', null],
    ['\tfuncFoo()', null],
    ['func Foo() {', 'Foo'],
    ['func Foo() string {', 'Foo'],
    ['func Foo(str string) string {', 'Foo'],
    ['func (b *Bar) Foo(str string) string {', 'Foo'],
  ]

  cases.forEach(([line, name]) => {
    it(`should extract ${JSON.stringify(name)} from "${line}"`, () => {
      assert.equal(name, extractFunctionName(line))
    })
  })
})

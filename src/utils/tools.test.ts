import os from "os"
import assert from "assert"
import { formatCmd } from "./tools"

describe('formatCmd()', () => {
  it('formats command with environment', () => {
    const out = os.platform() === 'win32'
      ? 'set FOO=bar & set BAR=foo & mycmd args'
      : 'env FOO=bar BAR=foo mycmd args'

    assert.equal(formatCmd({ FOO: 'bar', BAR: 'foo' }, "mycmd args"), out)
  })
})

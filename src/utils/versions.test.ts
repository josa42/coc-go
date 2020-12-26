import assert from 'assert'
import {
  compareVersions,
  isValidVersion,
  parseVersion,
  version,
} from './versions'

const v0: version = [0, 0, 0]
const v1: version = [1, 0, 0]
const v1_2: version = [1, 2, 0]
const v1_2_3: version = [1, 2, 3]

describe('isValidVersion()', () => {
  it('should recognise valid versions', () => {
    assert.ok(isValidVersion('v1.0.0'))
    assert.ok(isValidVersion('1.0.0'))
    assert.ok(isValidVersion('0.1.0'))
    assert.ok(isValidVersion('0.0.1'))
    assert.ok(isValidVersion('0.0.0'))
    assert.ok(isValidVersion('v0.0.0'))
  })

  it('should recognise invalid versions', () => {
    assert.ok(!isValidVersion('v 1.0.0'))
    assert.ok(!isValidVersion('1'))
    assert.ok(!isValidVersion('1.1'))
  })
})

describe('parseVersion()', () => {
  it('should parse simple versions', () => {
    assert.deepStrictEqual(parseVersion('v0.0.0'), v0)
    assert.deepStrictEqual(parseVersion('v1.0.0'), v1)
    assert.deepStrictEqual(parseVersion('v1.2.0'), v1_2)
    assert.deepStrictEqual(parseVersion('v1.2.3'), v1_2_3)
  })
})

describe('compareVersions()', () => {
  it('should compare equal version', () => {
    assert.throws(() => compareVersions('', ''))
    assert.strictEqual(compareVersions('1.0.0', '1.0.0'), 0)
    assert.strictEqual(compareVersions('1.2.0', '1.2.0'), 0)
    assert.strictEqual(compareVersions('1.2.3', '1.2.3'), 0)
    assert.strictEqual(compareVersions('v1.0.0', '1.0.0'), 0)
  })

  it('should compare greater version', () => {
    assert.throws(() => compareVersions('', ''))
    assert.strictEqual(compareVersions('2.0.0', '1.0.0'), 1)
    assert.strictEqual(compareVersions('1.1.0', '1.0.0'), 1)
    assert.strictEqual(compareVersions('1.0.4', '1.0.0'), 1)

    assert.strictEqual(compareVersions('v1.1.0', '1.0.0'), 1)
    assert.strictEqual(compareVersions('1.1.0', 'v1.0.0'), 1)
  })

  it('should compare smaller version', () => {
    assert.throws(() => compareVersions('', ''))
    assert.strictEqual(compareVersions('1.0.0', '2.0.0'), -1)
    assert.strictEqual(compareVersions('1.0.0', '1.1.0'), -1)
    assert.strictEqual(compareVersions('1.0.0', '1.0.4'), -1)

    assert.strictEqual(compareVersions('1.0.0', 'v1.1.0'), -1)
    assert.strictEqual(compareVersions('v1.0.0', '1.1.0'), -1)
  })
})

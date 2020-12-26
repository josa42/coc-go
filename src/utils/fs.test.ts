import tmp, { DirResult } from 'tmp'
import assert from 'assert'
import path from 'path'
import fs from 'fs'
import { createDir } from './fs'

describe('createDir()', () => {
  let tmpDir: DirResult

  const joinPath = (...parts: string[]) => path.join(tmpDir.name, ...parts)

  beforeEach(() => (tmpDir = tmp.dirSync({ unsafeCleanup: true })))
  afterEach(() => tmpDir.removeCallback())

  it('should create a directory', () => {
    const dirPath = joinPath('test')

    createDir(dirPath)

    assert.ok(fs.existsSync(dirPath))
  })

  it('should create nested directories', () => {
    const dirPath = joinPath('test', 'foo', 'bar')

    createDir(dirPath)

    assert.ok(fs.existsSync(dirPath))
  })

  it('should not fail if directory exists', () => {
    createDir(tmpDir.name)

    assert.ok(fs.existsSync(tmpDir.name))
  })
})

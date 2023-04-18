import { chmodSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import tmp, { DirResult } from 'tmp'
import { commandExists } from "./tools"

const isWindows = process.platform === 'win32'
const { PATH } = process.env

describe('commandExists()', () => {
  let tmpDir: DirResult
  let cmdFile: string
  let cmdPath: string

  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true })
    cmdFile = isWindows ? 'foo.exe' : 'foo'
    cmdPath = join(tmpDir.name, cmdFile)

    writeFileSync(cmdPath, '')
    chmodSync(cmdPath, 777)
  })


  afterEach(() => {
    process.env.PATH = PATH
    try {
      unlinkSync(cmdPath)
      tmpDir.removeCallback()
    } catch(err) { /* mute */ }
  })

  it('should find binary in PATH', async () => {
    process.env.PATH = tmpDir.name

    expect(await commandExists('foo')).toBe(true)
  })

  if (isWindows) it('should find binary in PATH width .exe extension', async () => {
    process.env.PATH = tmpDir.name

    expect(await commandExists('foo.exe')).toBe(true)
  })


  it('should not find binary if not in PATH', async () => {
    process.env.PATH = tmpDir.name

    expect(await commandExists('bar')).toBe(false)
  })

  it('should find binary with absolute path', async () => {
    process.env.PATH = ''

    expect(await commandExists(join(tmpDir.name, 'foo'))).toBe(true)
  })

  if (isWindows) it('should find binary with absolute path and .exe extension', async () => {
    process.env.PATH = ''

    expect(await commandExists(join(tmpDir.name, 'foo.exe'))).toBe(true)
  })


  it('should not find binary if absolute path does not', async () => {
    process.env.PATH = ''

    expect(await commandExists(join(tmpDir.name, 'bar'))).toBe(false)
  })

})

import fs from 'fs'
import path from 'path'

interface State {
  storagePath?: string
}

const state: State = {}

export interface GoConfig {
  enable: boolean
  goplsPath: string
  commandPath: string
  tags: GoTestsConfig
  tests: GoTestsConfig
}

export interface GoTagsConfig {
  tags?: string
  options?: string
  transform?: string
}

export interface GoTestsConfig {
  generateFlags?: string[]
}

export function setStoragePath(dir: string): void {
  state.storagePath = dir
}

export async function configDir(...names: string[]): Promise<string> {

  const storage = state.storagePath || ((): string => {
    const home = require('os').homedir()
    return path.join(home, '.config', 'coc', 'go')
  })()

  const dir = path.join(storage, ...names)

  return new Promise((resolve): void => {
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
    }
    resolve(dir)
  })
}

import fs from 'fs'
import path from 'path'

interface State {
  storagePath?: string
}

const state: State = {}

export interface GoConfig {
  enable: boolean
  goplsPath: string
  goplsOptions: GoplsOptions
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

// https://github.com/golang/tools/blob/master/gopls/doc/settings.md

export interface GoplsOptions {
  buildFlags: string[]
  env: { string: string }
  hoverKind: "NoDocumentation" | "SynopsisDocumentation" | "FullDocumentation" | "SingleLine" | "Structured"
  usePlaceholders: boolean
  linkTarget: string

  // experimental
  experimentalDisabledAnalyses: string[]
  staticcheck: boolean
  completionDocumentation: boolean
  completeUnimported: boolean
  deepCompletion: boolean
  fuzzyMatching: boolean
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
    fs.mkdirSync(dir, { recursive: true })
    resolve(dir)
  })
}

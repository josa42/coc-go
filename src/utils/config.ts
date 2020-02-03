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

  /**
   * Default: []
   */
  buildFlags: string[]

  /**
   * Default: {}
   */
  env: { string: string }

  /**
   * Default: "SynopsisDocumentation"
   */
  hoverKind: "NoDocumentation" | "SynopsisDocumentation" | "FullDocumentation"

  /**
   * Default: "pkg.go.dev"
   */
  linkTarget: string

  /**
   * Default: false
   */
  usePlaceholders: boolean

  /**
   * Experimental!
   * Default: false
   */
  completeUnimported: boolean

  /**
   * Experimental!
   * Default: true
   */
  completionDocumentation: boolean

  /**
   * Experimental!
   * Default: true
   */
  deepCompletion: boolean

  /**
   * Experimental!
   * Default: []
   */
  experimentalDisabledAnalyses: string[]

  /**
   * Experimental!
   * Default: true
   */
  fuzzyMatching: boolean

  /**
   * Experimental!
   * Default: false
   */
  staticcheck: boolean
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
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    resolve(dir)
  })
}

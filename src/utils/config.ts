import path from "path"
import os from "os"
import { workspace } from "coc.nvim"
import { createDir } from "./fs"

interface State {
  storagePath?: string
}

const state: State = {}

export function getConfig(): GoConfig {
  return workspace.getConfiguration().get("go") as GoConfig
}

export interface GoConfig {
  enable: boolean
  goplsPath: string
  goplsArgs: string[]
  goplsEnv: { string: string }
  goplsUseDaemon: boolean
  goplsOptions: GoplsOptions
  tags: GoTagsConfig
  tests: GoTestsConfig
  checkForUpdates: "disabled" | "inform" | "ask" | "install"
  disable: DisableConfig
}

export interface DisableConfig {
  workspaceFolders: boolean
  // TODO add if released: snippetCompletion: false,
  // dynamicRegister: boolean
  diagnostics: boolean
  completion: boolean
}

export interface GoTagsConfig {
  tags?: string
  options?: string
  transform?: string
  skipUnexported?: boolean
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
   * Default: []
   */
  env: string[]

  /**
   * Default: false
   */
  gofumpt: boolean

  /**
   * Default: "FullDocumentation"
   */
  hoverKind: "FullDocumentation" | "NoDocumentation" | "SingleLine" | "Structured" | "SynopsisDocumentation"

  /**
   * Default: "pkg.go.dev"
   */
  linkTarget: string

  /**
   * Default: ""
   */
  local: string

  /**
   * Default: false
   */
  usePlaceholders: boolean

  /**
   * Experimental!
   * Default: {}
   */
  analyses: { string: boolean }

  /**
   * Experimental!
   * Default: {}
   */
  annotations: { string: string }

  /**
   * Experimental!
   * Default: {}
   */
  codelens: { string: boolean }

  /**
   * Experimental!
   * Default: true
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
   * Default: true
   */
  expandWorkspaceToModule: boolean

  /**
   * Experimental!
   * Default: false
   */
  experimentalWorkspaceModule: boolean

  /**
   * Experimental!
   * Default: "Both"
   */
  importShortcut: "Both" | "Definition" | "Link"

  /**
   * Experimental!
   * Default: true
   */
  linksInHover: boolean

  /**
   * Experimental!
   * Default: true
   */
  literalCompletions: boolean

  /**
   * Experimental!
   * Default: "Fuzzy"
   */
  matcher: "CaseInsensitive" | "CaseSensitive" | "Fuzzy"

  /**
   * Experimental!
   * Default: false
   */
  staticcheck: boolean

  /**
   * Experimental!
   * Default: "Fuzzy"
   */
  symbolMatcher: "CaseInsensitive" | "CaseSensitive" | "Fuzzy"

  /**
   * Experimental!
   * Default: "Package"
   */
  symbolStyle: "Dynamic" | "Full" | "Package"

  /**
   * Experimental!
   * Default: true
   */
  tempModfile: boolean

  /**
   * Experimental!
   * Default: false
   */
  verboseWorkDoneProgress: boolean
}

export function setStoragePath(dir: string): void {
  state.storagePath = dir
}

export async function configDir(...names: string[]): Promise<string> {
  const storage =
    state.storagePath || path.join(os.homedir(), ".config", "coc", "go")

  const dir = path.join(storage, ...names)

  return new Promise((resolve): void => {
    createDir(dir)
    resolve(dir)
  })
}

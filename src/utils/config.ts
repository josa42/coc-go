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
   * Default: false
   */
  allowImplicitNetworkAccess: boolean

  /**
   * Default: false
   */
  allowModfileModifications: boolean

  /**
   * Default: {}
   */
  analyses: { string: boolean }

  /**
   * Default: {}
   */
  annotations: { string: boolean }

  /**
   * Default: []
   */
  buildFlags: string[]

  /**
   * Default: {}
   */
  codelenses: { string: boolean }

  /**
   * Default: "100ms"
   */
  completionBudget: string

  /**
   * Default: []
   */
  directoryFilters: string[]

  /**
   * Default: {}
   */
  env: { string: string }

  /**
   * Default: true
   */
  expandWorkspaceToModule: boolean

  /**
   * Default: "250ms"
   */
  experimentalDiagnosticsDelay: string

  /**
   * Default: true
   */
  experimentalPackageCacheKey: boolean

  /**
   * Default: true
   */
  experimentalPostfixCompletions: boolean

  /**
   * Default: false
   */
  experimentalTemplateSupport: boolean

  /**
   * Default: false
   */
  experimentalUseInvalidMetadata: boolean

  /**
   * Default: false
   */
  experimentalWorkspaceModule: boolean

  /**
   * Default: false
   */
  gofumpt: boolean

  /**
   * Default: "FullDocumentation"
   */
  hoverKind: "FullDocumentation" | "NoDocumentation" | "SingleLine" | "Structured" | "SynopsisDocumentation"

  /**
   * Default: "Both"
   */
  importShortcut: "Both" | "Definition" | "Link"

  /**
   * Default: "pkg.go.dev"
   */
  linkTarget: string

  /**
   * Default: true
   */
  linksInHover: boolean

  /**
   * Default: ""
   */
  local: string

  /**
   * Default: "Fuzzy"
   */
  matcher: "CaseInsensitive" | "CaseSensitive" | "Fuzzy"

  /**
   * Default: "Normal"
   */
  memoryMode: "DegradeClosed" | "Normal"

  /**
   * Default: true
   */
  semanticTokens: boolean

  /**
   * Default: false
   */
  staticcheck: boolean

  /**
   * Default: "Fuzzy"
   */
  symbolMatcher: "CaseInsensitive" | "CaseSensitive" | "Fuzzy"

  /**
   * Default: "Dynamic"
   */
  symbolStyle: "Dynamic" | "Full" | "Package"

  /**
   * Default: false
   */
  usePlaceholders: boolean

  /**
   * Default: false
   */
  verboseOutput: boolean
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

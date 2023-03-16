import path from "path"
import os from "os"
import fs from "fs"
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
  snippetCompletion?: boolean
  diagnostics?: boolean
  completion?: boolean
  features?: string[]
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
   * Default: "1s"
   */
  diagnosticsDelay: string

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
   * Default: true
   */
  experimentalPostfixCompletions: boolean

  /**
   * Default: false
   */
  gofumpt: boolean

  /**
   * Default: {}
   */
  hints: { string: boolean }

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
   * Default: false
   */
  noSemanticNumber: boolean

  /**
   * Default: false
   */
  noSemanticString: boolean

  /**
   * Default: false
   */
  semanticTokens: boolean

  /**
   * Default: []
   */
  standaloneTags: string[]

  /**
   * Default: false
   */
  staticcheck: boolean

  /**
   * Default: "FastFuzzy"
   */
  symbolMatcher: "CaseInsensitive" | "CaseSensitive" | "FastFuzzy" | "Fuzzy"

  /**
   * Default: "Dynamic"
   */
  symbolStyle: "Dynamic" | "Full" | "Package"

  /**
   * Default: []
   */
  templateExtensions: string[]

  /**
   * Default: false
   */
  usePlaceholders: boolean

  /**
   * Default: false
   */
  verboseOutput: boolean

  /**
   * Default: "Off"
   */
  vulncheck: "Imports" | "Off"
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

async function stateFile() {
  return path.join(await configDir(), 'state.json')
}

async function getStateData(): Promise<object> {
  try {
    const f = await stateFile()
    const d = JSON.parse(await fs.promises.readFile(f, 'utf-8'))

    return d || {}
  } catch(err) { /* mute */ }

  return {}
}

async function setStateData(data: object): Promise<void> {
  try {
    await fs.promises.writeFile(await stateFile(), JSON.stringify(data, null, '  '))
  } catch(err) { /* mute */ }
}

export async function getState<T>(key: string): Promise<T> {
  const d = await getStateData()
  return d[key] || ''
}

export async function setState<T>(key: string, value: T) {
  const d = await getStateData()
  d[key] = value
  await setStateData(d)
}


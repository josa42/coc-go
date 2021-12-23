import { ExtensionContext, LanguageClient, LanguageClientOptions, commands, services, window, workspace } from 'coc.nvim'
import { ChildProcess, spawn } from 'child_process'
import os from 'os'
import fs from 'fs'
import path from "path"
import { commandExists, goBinPath, installGoBin } from './utils/tools'
import { checkGopls, installGomodifytags, installGoplay, installGopls, installGotests, installImpl, installTools, version } from './commands'
import { addTags, clearTags, removeTags } from './utils/modify-tags'
import { getConfig, GoplsOptions, setStoragePath } from './utils/config'
import { activeTextDocument } from './editor'
import { GOPLS } from './binaries'
import { generateTestsAll, generateTestsExported, generateTestsFunction, toogleTests } from './utils/tests'
import { openPlayground } from './utils/playground'
import { generateImplStubs } from './utils/impl'

const restartConfigs = [
  'go.goplsArgs',
  'go.goplsOptions',
  'go.goplsPath',
  'go.goplsUseDaemon',
]

export async function activate(context: ExtensionContext): Promise<void> {

  setStoragePath(context.storagePath)

  if (getConfig().enable === false) {
    return
  }

  registerGeneral(context)

  registerGopls(context)
  registerTest(context)
  registerTags(context)
  registerPlaygroud(context)
  registerGoImpl(context)
  registerTools(context)
}

async function registerGeneral(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      "go.version",
      () => version()
    ),
  )
}

async function registerGopls(context: ExtensionContext): Promise<void> {
  const config = getConfig()

  const command = await goplsPath(config.goplsPath)
  if (!command) {
    return
  }

  const args = config.goplsArgs ? [...config.goplsArgs] : []

  if (config.goplsUseDaemon !== false && !args.find(arg => arg.startsWith('-remote'))) {
    // Use daemon by default
    args.push('-remote=auto')
  }
  let goplsOptions = config.goplsOptions
  if (config.goplsOptions.local === '') { // Parse go.mod and set the -local options for goimports.
    const modulePath = tryParseGoModulePath(workspace.cwd)
    if (modulePath !== '') {
      let copiedGoplsOptions = Object.assign({}, config.goplsOptions)
      copiedGoplsOptions.local = modulePath
      goplsOptions = copiedGoplsOptions as GoplsOptions
    }
  }

  // TMPDIR needs to be resetted, because its altered by coc.nvim, which breaks
  // the automatic deamon launching of gopls.
  // See: https://github.com/neoclide/coc.nvim/commit/bdd9a9e1401fe6fdd57a9bd078e3651ecf1e0202
  const tmpdir = await workspace.nvim.eval('$TMPDIR') as string

  const server = (): Promise<ChildProcess> => {
    return new Promise(resolve => {
      resolve(spawn(command, args, {
        cwd: workspace.cwd,
        env: { ...process.env, TMPDIR: tmpdir, ...config.goplsEnv },
      }))
    })
  }

  // https://github.com/neoclide/coc.nvim/blob/master/src/language-client/client.ts#L684
  const clientOptions: LanguageClientOptions = {
    documentSelector: ['go', 'gomod'],
    initializationOptions: () => goplsOptions,
    disableWorkspaceFolders: config.disable.workspaceFolders,
    disableDiagnostics: config.disable.diagnostics,
    disableCompletion: config.disable.completion,
    // TODO disableSnippetCompletion: config.disable.snippetCompletion,
  }

  const client = new LanguageClient('go', 'gopls', server, clientOptions)

  if (config.checkForUpdates !== 'disabled' && !config.goplsPath) {
    await checkGopls(client, config.checkForUpdates)
  }

  context.subscriptions.push(
    services.registLanguageClient(client),

    // restart gopls if options changed
    workspace.onDidChangeConfiguration(async (e) => {
      if (restartConfigs.find(k => e.affectsConfiguration(k))) {
        await client.stop()
        client.restart()
      }
    }),

    commands.registerCommand(
      "go.install.gopls",
      () => installGopls(client)
    )
  )
}

function tryParseGoModulePath(directory: string): string {
  const modFile = path.join(directory, 'go.mod')
  if (!fs.existsSync(modFile)) {
    return ""
  }
  const lines = fs.readFileSync(modFile, 'utf8').split(os.EOL)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('module ') == 0) { // Syntax: module {module-path}.
      return lines[i].split('module ')[1]
    }
  }
  return ""
}

async function goplsPath(goplsPath: string): Promise<string | null> {
  if (goplsPath) {
    if (goplsPath.startsWith('~')) {
      goplsPath = os.homedir() + goplsPath.slice(1)
    }
    if (!await commandExists(goplsPath)) {
      window.showMessage(`goplsPath is configured ("${goplsPath}"), but does not exist!`, 'error')
      return null
    }

    return goplsPath
  }

  if (!await installGoBin(GOPLS)) {
    return
  }

  return goBinPath(GOPLS)
}

async function registerGoImpl(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      "go.install.impl",
      () => installImpl()
    ),
    commands.registerCommand(
      "go.impl.cursor",
      async () => generateImplStubs(await activeTextDocument())
    )
  )

}

async function registerTest(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      "go.install.gotests",
      () => installGotests()
    ),
    commands.registerCommand(
      "go.test.generate.file",
      async () => generateTestsAll(await activeTextDocument())
    ),
    commands.registerCommand(
      "go.test.generate.exported",
      async () => generateTestsExported(await activeTextDocument())
    ),
    commands.registerCommand(
      "go.test.generate.function",
      async () => generateTestsFunction(await activeTextDocument())
    ),
    commands.registerCommand(
      "go.test.toggle",
      async () => toogleTests(await activeTextDocument())
    ),
  )
}

async function registerTags(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      "go.install.gomodifytags",
      () => installGomodifytags()
    ),
    commands.registerCommand(
      "go.tags.add",
      async (...tags) => addTags(await activeTextDocument(), { tags })
    ),
    commands.registerCommand(
      "go.tags.add.line",
      async (...tags) => addTags(await activeTextDocument(), { tags, selection: "line" })
    ),
    commands.registerCommand(
      "go.tags.add.prompt",
      async () => addTags(await activeTextDocument(), { prompt: true })
    ),
    commands.registerCommand(
      "go.tags.remove",
      async (...tags) => removeTags(await activeTextDocument(), { tags })
    ),
    commands.registerCommand(
      "go.tags.remove.line",
      async (...tags) => removeTags(await activeTextDocument(), { tags, selection: "line" })
    ),
    commands.registerCommand(
      "go.tags.remove.prompt",
      async () => removeTags(await activeTextDocument(), { prompt: true })
    ),
    commands.registerCommand(
      "go.tags.clear",
      async () => clearTags(await activeTextDocument())
    ),
    commands.registerCommand(
      "go.tags.clear.line",
      async () => clearTags(await activeTextDocument(), { selection: "line" })
    ),
  )
}

async function registerPlaygroud(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      "go.install.goplay",
      () => installGoplay()
    ),
    commands.registerCommand(
      "go.playground",
      async () => openPlayground(await activeTextDocument())
    )
  )
}

async function registerTools(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand(
      "go.install.tools",
      () => installTools()
    )
  )
}

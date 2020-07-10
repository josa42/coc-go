import { commands, ExtensionContext, LanguageClient, ServerOptions, workspace, services, LanguageClientOptions } from 'coc.nvim'
import { installGoBin, goBinPath, commandExists } from './utils/tools'
import { installGopls, installGomodifytags, installGotests, version, installGoplay, checkGopls, installImpl } from './commands'
import { addTags, removeTags, clearTags } from './utils/modify-tags'
import { setStoragePath, getConfig } from './utils/config'
import { activeTextDocument } from './editor'
import { GOPLS } from './binaries'
import { generateTestsAll, generateTestsExported, toogleTests } from './utils/tests'
import { openPlayground } from './utils/playground'
import { generateImplStubs } from './utils/impl'

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

  const command = config.goplsPath || await goBinPath(GOPLS)
  if (!await commandExists(command) && !await installGoBin(GOPLS)) {
    return
  }

  const serverOptions: ServerOptions = {
    command,
    args: config.goplsArgs
  }

  // https://github.com/neoclide/coc.nvim/blob/master/src/language-client/client.ts#L684
  const clientOptions: LanguageClientOptions = {
    documentSelector: ['go'],
    initializationOptions: () => getConfig().goplsOptions,
    disableWorkspaceFolders: config.disableWorkspaceFolders,
    disableDiagnostics: config.disableDiagnostics,
    disableCompletion: config.disableCompletion,
    // TODO disableSnippetCompletion: config.disable.snippetCompletion,
  }

  const client = new LanguageClient('go', 'gopls', serverOptions, clientOptions)

  if (config.checkForUpdates !== 'disabled') {
    await checkGopls(client, config.checkForUpdates)
  }

  context.subscriptions.push(
    services.registLanguageClient(client),

    // restart gopls if options changed
    workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('go.goplsOptions')) {
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

import { commands, ExtensionContext, LanguageClient, ServerOptions, workspace, services, LanguageClientOptions } from 'coc.nvim'
import { installGoBin, goBinPath, commandExists } from './utils/tools'
import { installGopls, installGomodifytags, installGotests, version } from './commands'
import { addTags, removeTags, clearTags } from './utils/modify-tags'
import { setStoragePath } from './utils/config'
import { activeTextDocument } from './editor'
import { GOPLS, GOMODIFYTAGS, GOTESTS } from './binaries'
import { generateTestsAll, generateTestsExported, toogleTests } from './utils/tests'

export async function activate(context: ExtensionContext): Promise<void> {

  setStoragePath(context.storagePath)

  const config = workspace.getConfiguration().get('go', {}) as any
  if (config.enable === false) {
    return
  }

  const command = config.commandPath || await goBinPath(GOPLS)
  if (!await commandExists(command)) {
    await installGoBin(GOPLS)
  }

  installGoBin(GOMODIFYTAGS)
  installGoBin(GOTESTS)

  const serverOptions: ServerOptions = { command }

  const clientOptions: LanguageClientOptions = {
    documentSelector: ['go']
  }

  const client = new LanguageClient('go', 'gopls', serverOptions, clientOptions)

  context.subscriptions.push(
    services.registLanguageClient(client),
    commands.registerCommand(
      "go.version",
      () => version()
    ),
    commands.registerCommand(
      "go.install.gopls",
      () => installGopls(client)
    ),
    commands.registerCommand(
      "go.install.gomodifytags",
      () => installGomodifytags()
    ),
    commands.registerCommand(
      "go.install.gotests",
      () => installGotests()
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
    )
  )
}



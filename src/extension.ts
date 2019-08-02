import {commands, ExtensionContext, LanguageClient, ServerOptions, workspace, services, LanguageClientOptions} from 'coc.nvim'
import {installGoBin, goBinPath, commandExists} from './utils/tools'
import {installGopls, installGomodifytags, version, activeTextDocument} from './commands'
import {addTags, removeTags, clearTags} from './utils/modify-tags'
import {setStoragePath} from './utils/config'

import {GOPLS, GOMODIFYTAGS} from './binaries'

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
  await installGoBin(GOMODIFYTAGS)

  const serverOptions: ServerOptions = {command}

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
      "go.tags.add",
      async () => addTags(await activeTextDocument())
    ),
    commands.registerCommand(
      "go.tags.add.prompt",
      async () => addTags(await activeTextDocument(), {prompt: true})
    ),
    commands.registerCommand(
      "go.tags.remove",
      async () => removeTags(await activeTextDocument())
    ),
    commands.registerCommand(
      "go.tags.remove.prompt",
      async () => removeTags(await activeTextDocument(), {prompt: true})
    ),
    commands.registerCommand(
      "go.tags.clear",
      async () => clearTags(await activeTextDocument())
    )
  )
}



import { commands, ExtensionContext, LanguageClient, ServerOptions, workspace, services, LanguageClientOptions } from 'coc.nvim'
import { installGoBin, goBinPath, commandExists } from './utils/tools'
import { installGopls, installGomodifytags, addTags, removeTags, version } from './commands'

import { GOPLS } from './binaries'

export async function activate(context: ExtensionContext): Promise<void> {

  const config = workspace.getConfiguration().get('go', {}) as any
  if (config.enable === false) {
    return
  }

  const command = config.commandPath || await goBinPath(GOPLS)
  if (!await commandExists(command)) {
    await installGoBin(GOPLS)
  }

  const serverOptions: ServerOptions = { command }

  const clientOptions: LanguageClientOptions = {
    documentSelector: ['go']
  }

  const client = new LanguageClient('go', 'gopls', serverOptions, clientOptions)

  context.subscriptions.push(
    services.registLanguageClient(client),
    commands.registerCommand("go.version", () => version()),
    commands.registerCommand("go.install.gopls", () => installGopls(client)),
    commands.registerCommand("go.install.gomodifytags", () => installGomodifytags()),
    commands.registerCommand("go.add.tags", addTags),
    commands.registerCommand("go.remove.tags", removeTags)
  )
}


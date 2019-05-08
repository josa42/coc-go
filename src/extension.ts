import { commands, ExtensionContext, LanguageClient, ServerOptions, workspace, services, LanguageClientOptions, RevealOutputChannelOn } from 'coc.nvim'
import { installGoTool, goToolBin, commandExists } from './utils/tools'
import { installGopls, version } from './commands'

export async function activate(context: ExtensionContext): Promise<void> {

  const config = workspace.getConfiguration().get('go', {}) as any
  if (config.enable === false) {
    return
  }

  const command = config.commandPath || await goToolBin('gopls')
  if (!await commandExists(command)) {
    await installGoTool('gopls')
  }

  const serverOptions: ServerOptions = { command }

  const clientOptions: LanguageClientOptions = {
    documentSelector: ['go']
  }

  const client = new LanguageClient('go', 'gopls', serverOptions, clientOptions)

  context.subscriptions.push(
    services.registLanguageClient(client),
    commands.registerCommand("go.version", () => version()),
    commands.registerCommand("go.install.gopls", () => installGopls(client))
  )
}



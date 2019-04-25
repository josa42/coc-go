import which from 'which'
import path from 'path'
import { commands, ExtensionContext, LanguageClient, ServerOptions, workspace, services, LanguageClientOptions, RevealOutputChannelOn } from 'coc.nvim'
import { installGoTool, goToolBin, runGoTool } from './utils/tools'

// import coc from 'coc.nvim'

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context
  const config = workspace.getConfiguration().get('gopls', {}) as any
  const enable = config.enable
  if (enable === false) return


  const command = config.commandPath || await goToolBin('gopls')

  if (!await goplsExists(command)) {
    await installGoTool('gopls')
  }

  let serverOptions: ServerOptions = { command }

  let clientOptions: LanguageClientOptions = {
    documentSelector: ['go'],
    outputChannelName: 'go',
    revealOutputChannelOn: RevealOutputChannelOn.Never,
    initializationOptions: {}
  }

  let client = new LanguageClient('go', 'gopls', serverOptions, clientOptions)

  subscriptions.push(
    services.registLanguageClient(client)
  )

  subscriptions.push(commands.registerCommand("go.installGopls", async () => {
    if (!await installGoTool('gopls')) {
      workspace.showMessage('Installing gopls failed', 'error')
      return
    }
    workspace.showMessage('Restart gopls', 'more')
    client.restart()
  }))

  subscriptions.push(commands.registerCommand("go.version", async () => {
    const v = require(path.resolve(__dirname, '..', 'package.json')).version
    workspace.showMessage(`Version: ${v}`, 'more')
  }))
}

async function goplsExists(gopls: string): Promise<boolean> {
  return new Promise(resolve => {
    which(gopls, (err: Error, _: string) => resolve(err == null));
  });
}



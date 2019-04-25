import which from 'which'
import { commands, ExtensionContext, LanguageClient, ServerOptions, workspace, services, LanguageClientOptions, RevealOutputChannelOn } from 'coc.nvim'
import path from 'path'
import fs from 'fs'

// import coc from 'coc.nvim'

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context
  const config = workspace.getConfiguration().get('gopls', {}) as any
  const enable = config.enable
  if (enable === false) return


  const command = config.commandPath || await goplsBin()

  if (!await goplsExists(command)) {
    await installGopls()
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

  commands.registerCommand("go.installGopls", async () => {
    if (!await installGopls()) {
      workspace.showMessage('Installing gopls failed', 'error')
      return
    }
    workspace.showMessage('Restart gopls', 'more')
    client.restart()
  })
}

async function goplsExists(gopls: string): Promise<boolean> {
  return new Promise(resolve => {
    which(gopls, (err: Error, _: string) => resolve(err == null));
  });
}

async function goRun(args: string): Promise<boolean> {
  const gopath = await configDir('tools')

  const cmd = `GOPATH=${gopath}; go ${args}`
  const res = await workspace.runTerminalCommand(cmd)

  return res.success
}

async function installGopls() {

  const gopls = await goplsBin()

  return (
    await goRun('get -d -u golang.org/x/tools/cmd/gopls') &&
    await goRun(`build -o ${gopls} golang.org/x/tools/cmd/gopls`)
  )
}

async function goplsBin(): Promise<string> {
  return path.join(await configDir('bin'), 'gopls')
}

async function configDir(...names: string[]): Promise<string> {
  const home = require('os').homedir();
  const dir = path.join(home, '.config', 'coc', 'go', ...names);

  return new Promise((resolve) => {
    fs.mkdirSync(dir, { recursive: true });
    resolve(dir)
  })
}

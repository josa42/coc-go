import path from 'path'
import { LanguageClient, workspace } from 'coc.nvim'
import { installGoTool } from './utils/tools'

export async function version() {
  const v = require(path.resolve(__dirname, '..', 'package.json')).version
  workspace.showMessage(`Version: ${v}`, 'more')
}

export async function installGopls(client: LanguageClient) {
  await installGoTool('gopls')

  if (client.needsStop()) {
    await client.stop()
    await client.start()
  }
}

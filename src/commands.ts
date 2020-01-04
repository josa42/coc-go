import path from 'path'
import {LanguageClient, workspace} from 'coc.nvim'
import {installGoBin} from './utils/tools'

import {GOPLS, GOMODIFYTAGS, GOTESTS} from './binaries'

export async function version(): Promise<void> {
  const v = require(path.resolve(__dirname, '..', 'package.json')).version
  workspace.showMessage(`Version: ${v}`, 'more')
}

export async function installGopls(client: LanguageClient): Promise<void> {
  await installGoBin(GOPLS, true)

  if (client.needsStop()) {
    await client.stop()
    client.restart()
  }
}

export async function installGomodifytags(): Promise<void> {
  await installGoBin(GOMODIFYTAGS, true)
}

export async function installGotests(): Promise<void> {
  await installGoBin(GOTESTS, true)
}


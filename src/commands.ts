import path from 'path'
import {LanguageClient, workspace} from 'coc.nvim'
import {installGoBin} from './utils/tools'

import {GOPLS, GOMODIFYTAGS} from './binaries'

export async function version() {
  const v = require(path.resolve(__dirname, '..', 'package.json')).version
  workspace.showMessage(`Version: ${v}`, 'more')
}

export async function installGopls(client: LanguageClient) {
  await installGoBin(GOPLS, true)

  if (client.needsStop()) {
    await client.stop()
    await client.start()
  }
}

export async function installGomodifytags() {
  await installGoBin(GOMODIFYTAGS, true)
}


import path from 'path'
import {LanguageClient, workspace} from 'coc.nvim'
import {installGoBin} from './utils/tools'
import {TextDocument} from 'vscode-languageserver-protocol'

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

// let { mode } = await workspace.nvim.mode
// let r = await workspace.getSelectedRange(mode, doc.textDocument)
// workspace.showMessage(JSON.stringify(r))


export async function activeTextDocument(): Promise<TextDocument> {
 const doc = await workspace.document

  if (doc.filetype != 'go') {
    throw "Not an go document";
  }

  return doc.textDocument
}

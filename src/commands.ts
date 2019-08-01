import path from 'path'
import {LanguageClient, workspace} from 'coc.nvim'
import {TextDocument, Position} from 'vscode-languageserver-protocol'
import {installGoBin} from './utils/tools'
import {modifyTags} from './utils/modify-tags'

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

export async function addTags(/* document?: TextDocument */): Promise<void> {
  const doc = await workspace.document

  if (doc.filetype != 'go') {
    return
  }

  return modifyTags({action: 'add', document: doc.textDocument})
}

export async function removeTags(/* document?: TextDocument */): Promise<void> {
  const doc = await workspace.document

  if (doc.filetype != 'go') {
    return
  }

  return modifyTags({action: 'remove', document: doc.textDocument})
}


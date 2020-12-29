import { workspace } from 'coc.nvim'
import { TextDocument } from 'vscode-languageserver-textdocument'

export async function activeTextDocument(): Promise<TextDocument> {
  const doc = await workspace.document
  if (doc.filetype != 'go') {
    throw "Not a go document"
  }

  return doc.textDocument
}


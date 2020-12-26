import { workspace } from 'coc.nvim'
import { TextDocument, TextEdit } from 'vscode-languageserver-protocol'
import { IMPL } from '../binaries'
import { execTool } from './tools'

const interfaceRegex = /^(\w+ \*?\w+ )?([\w./]+)$/

export async function generateImplStubs(document: TextDocument): Promise<void> {
  try {
    const implInput = await workspace.requestInput(
      'Enter receiver and interface [f *File io.Closer]'
    )

    if (implInput == null) {
      workspace.showMessage('No input detected! Aborting.', 'warning')
      return
    }

    const matches = implInput.match(interfaceRegex)
    if (!matches) {
      throw Error(`Cannot parse input: ${implInput}`)
    }

    const edit = await runGoImpl(document, [matches[1], matches[2]])

    await workspace.applyEdit({ changes: { [document.uri]: [edit] } })
  } catch (error) {
    workspace.showMessage(error, 'error')
  }
}

async function runGoImpl(
  document: TextDocument,
  args: string[]
): Promise<TextEdit> {
  const stdout = await execTool(IMPL, args)

  const { line } = await workspace.getCursorPosition()
  const insertPos = { line: line + 1, character: 0 }

  const lineText = await workspace.getLine(document.uri, line)
  const newText = lineText.trim() === '' ? stdout : `\n${stdout}`

  return {
    range: {
      start: insertPos,
      end: insertPos,
    },
    newText,
  }
}

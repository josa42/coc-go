import { workspace } from 'coc.nvim'
import { TextDocument, TextEdit } from 'vscode-languageserver-protocol'
import { IMPL } from '../binaries'
import { goBinPath } from './tools'
import cp = require('child_process')

const interfaceRegex = /^(\w+ \*?\w+ )?([\w./]+)$/

export async function generateImplStubs(document: TextDocument): Promise<void> {
  try {
    const implInput = await workspace.requestInput("Enter receiver and interface [f *File io.Closer]")

    if (implInput == null) {
      workspace.showMessage("No input detected! Aborting.", "warning")
      return
    }

    const matches = implInput.match(interfaceRegex)
    if (!matches) {
      throw Error(`Cannot parse input: ${implInput}`)
    }

    const edit = await runGoImpl(document, [matches[1], matches[2]])

    await workspace.applyEdit({ changes: { [document.uri]: [edit] } })
  } catch (error) {
    workspace.showMessage(error, "error")
  }
}

async function runGoImpl(document: TextDocument, args: string[]): Promise<TextEdit> {
  const impl = await goBinPath(IMPL)

  return new Promise((resolve, reject) => {
    const p = cp.execFile(impl, args, { cwd: workspace.cwd }, async (err, stdout, stderr) => {
      if (err && (err as any).code === "ENOENT") {
        return reject(`Error: Command impl not found! Run "CocCommand go.install.impl" to install it and try again.`)
      }

      if (err) {
        return reject(`Error: ${stderr}`)
      }

      const { line } = await workspace.getCursorPosition()
      const insertPos = { line: line + 1, character: 0 }

      const lineText = await workspace.getLine(document.uri, line)
      const newText = lineText.trim() === ''
        ? stdout
        : `\n${stdout}`

      return resolve({
        range: {
          start: insertPos,
          end: insertPos
        },
        newText
      })
    }
    )
    if (p.pid) {
      p.stdin.end()
    }
  })
}


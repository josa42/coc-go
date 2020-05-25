import { workspace } from 'coc.nvim'
import { TextDocument, TextEdit } from 'vscode-languageserver-protocol'
import { IMPL } from '../binaries'
import { goBinPath } from './tools'
import cp = require('child_process')

const interfaceRegex = /^(\w+ \*?\w+ )?([\w./]+)$/

export async function generateImplStubs(document: TextDocument): Promise<void> {
  try {
    const implInput = await workspace.requestInput("Enter receiver and interface")

    if (implInput == null) {
      workspace.showMessage("No input detected! Aborting.", "warning")
      return
    }

    const matches = implInput.match(interfaceRegex)
    if (!matches) {
      throw Error(`Cannot parse input: ${implInput}`)
    }

    const edit = await runGoImpl([matches[1], matches[2]])

    await workspace.applyEdit({ changes: { [document.uri]: [edit] } })
  } catch (error) {
    workspace.showMessage(error, "error")
  }
}

async function runGoImpl(args: string[]): Promise<TextEdit> {
  const impl = await goBinPath(IMPL)

  return new Promise((resolve, reject) => {
    const p = cp.execFile(impl, args, { cwd: workspace.cwd }, async (err, stdout, stderr) => {
      if (err && (err as any).code === "ENOENT") {
        return reject(`Error: Command impl not found! Run "CocCommand go.install.goimpl" to install it and try again.`)
      }

      if (err) {
        return reject(`Error: ${stderr}`)
      }

      const curPos = await workspace.getCursorPosition()

      return resolve({
        range: {
          start: curPos,
          end: { line: curPos.line + 1, character: curPos.character }
        },
        newText: "\n" + stdout
      })
    }
    )
    if (p.pid) {
      p.stdin.end()
    }
  })
}


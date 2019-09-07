import { TextDocument } from 'vscode-languageserver-protocol'
import { workspace } from 'coc.nvim'
import { execFile } from 'child_process'
import { goBinPath, installGoBin, commandExists } from './tools'
import { GOPLAY } from '../binaries'

export async function openPlayground(document: TextDocument): Promise<boolean> {

  return runGoplay(document.getText())
}

async function runGoplay(code: string): Promise<boolean> {

  const bin = await goBinPath(GOPLAY)

  if (!await commandExists(bin)) {
    await installGoBin(GOPLAY)
  }

  return new Promise<boolean>((resolve, reject): void => {
    const p = execFile(bin, ['-'], {}, async (err, stdout, stderr) => {
      workspace.showMessage(stdout)

      if (err) {
        workspace.showMessage(`${stderr}`, "error")
        return reject(err)
      }

      resolve(true)
    })
    if (p.pid) {
      p.stdin.end(code)
    }
  })
}


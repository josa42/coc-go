import { TextDocument } from 'vscode-languageserver-textdocument'
import { window } from 'coc.nvim'
import { execTool } from './tools'
import { GOPLAY } from '../binaries'

export async function openPlayground(document: TextDocument): Promise<boolean> {

  return runGoplay(document.getText())
}

async function runGoplay(code: string): Promise<boolean> {

  try {
    const stdout = await execTool(GOPLAY, ['-'], code)
    window.showMessage(stdout)
    return true

  } catch (err) {
    window.showMessage(`${err}`, "error")
    return false
  }

}


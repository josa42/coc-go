import { TextDocument } from 'vscode-languageserver-protocol';
import { workspace } from 'coc.nvim';
import { execTool } from './tools';
import { GOPLAY } from '../binaries';

export async function openPlayground(document: TextDocument): Promise<boolean> {
  return runGoplay(document.getText());
}

async function runGoplay(code: string): Promise<boolean> {
  try {
    const stdout = await execTool(GOPLAY, ['-'], code);
    workspace.showMessage(stdout);
    return true;
  } catch (err) {
    workspace.showMessage(`${err}`, 'error');
    return false;
  }
}

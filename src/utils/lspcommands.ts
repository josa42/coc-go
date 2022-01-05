import { commands, workspace } from 'coc.nvim'

export async function goplsTidy() {
  const doc = await workspace.document
  await commands.executeCommand('gopls.tidy', { URIs: [doc.uri] })
}


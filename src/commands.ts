import path from 'path'
import { LanguageClient, workspace } from 'coc.nvim'
import { installGoBin, runGoTool } from './utils/tools'

import { GOPLS, GOMODIFYTAGS, GOTESTS, GOPLAY } from './binaries'

export async function version(): Promise<void> {
  const v = require(path.resolve(__dirname, '..', 'package.json')).version

  let v2 = "unknown"
  const [, goplsOut] = await runGoTool("gopls", ["version"])
  const m = goplsOut.match(/golang\.org\/x\/tools\/gopls (v.*)/)
  if (m) {
    v2 = m[1]
  }

  workspace.showMessage(`Version: coc-go ${v}; gopls ${v2}`, 'more')
}

export async function installGopls(client: LanguageClient): Promise<void> {
  await installGoBin(GOPLS, true)

  if (client.needsStop()) {
    await client.stop()
    client.restart()
  }
}

export async function installGomodifytags(): Promise<void> {
  await installGoBin(GOMODIFYTAGS, true)
}

export async function installGotests(): Promise<void> {
  await installGoBin(GOTESTS, true)
}

export async function installGoplay(): Promise<void> {
  await installGoBin(GOPLAY, true)
}


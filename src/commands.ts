import { LanguageClient, workspace } from 'coc.nvim'
import { GOMODIFYTAGS, GOPLS, GOTESTS } from './binaries'
import { installGoBin } from './utils/tools'

declare var __webpack_require__: any
declare var __non_webpack_require__: any
const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require

export async function version(): Promise<void> {
  const v = requireFunc('../package.json').json
  workspace.showMessage(`Version: ${v}`, 'more')
}

export async function installGopls(client: LanguageClient): Promise<void> {
  await installGoBin(GOPLS, true)

  if (client.needsStop()) {
    await client.stop()
    client.start()
  }
}

export async function installGomodifytags(): Promise<void> {
  await installGoBin(GOMODIFYTAGS, true)
}

export async function installGotests(): Promise<void> {
  await installGoBin(GOTESTS, true)
}


import path from 'path'
import { LanguageClient, workspace } from 'coc.nvim'
import { installGoBin, runGoTool } from './utils/tools'
import checkLatestTag from './utils/checktag'

import { GOPLS, GOMODIFYTAGS, GOTESTS, GOPLAY } from './binaries'
import { compareVersions, isValidVersion } from './utils/versions'

export async function version(): Promise<void> {
  const v1 = require(path.resolve(__dirname, '..', 'package.json')).version
  const v2 = await goplsVersion() || 'unknown'

  workspace.showMessage(`Version: coc-go ${v1}; gopls ${v2}`, 'more')
}

export async function installGopls(client: LanguageClient): Promise<void> {
  await installGoBin(GOPLS, true)

  if (client.needsStop()) {
    await client.stop()
    client.restart()
  }
}

export async function checkGopls(client: LanguageClient, mode: 'ask' | 'inform' | 'install'): Promise<void> {

  const [latest, current] = await Promise.all([
    checkLatestTag("golang/tools", /^gopls\//),
    goplsVersion()
  ])

  try {
    let install = false
    switch (compareVersions(latest, current)) {
      case 0:
        workspace.showMessage(`[gopls] up-to-date: ${current}`)
        break
      case 1:
        switch (mode) {
          case 'install':
            install = true
            break
          case 'ask':
            install = await workspace.showPrompt(`[gopls] Install update? ${current} => ${latest}`)
            break
          case 'inform':
            workspace.showMessage(`[gopls] update available: ${current} => ${latest}`)
            break
        }

        break
      case -1:
        workspace.showMessage(`[gopls] current: ${current} | latest: ${latest}`)
        break
    }

    if (install) {
      await installGopls(client)
    }
  } catch (e) {
    workspace.showMessage(e.toString())
  }
}

async function goplsVersion() {
  const [, versionOut] = await runGoTool("gopls", ["version"])

  const m = versionOut.trim().match(/^golang\.org\/x\/tools\/gopls (v?\d+\.\d+\.\d+)/)
  if (m && isValidVersion(m[1])) {
    return m[1]
  }

  return ''

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


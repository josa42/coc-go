import path from 'path'
import fs from 'fs'
import { LanguageClient, window } from 'coc.nvim'
import { installGoBin, runGoTool } from './utils/tools'
import checkLatestTag from './utils/checktag'

import { GOMODIFYTAGS, GOPLAY, GOPLS, GOTESTS, IMPL, TOOLS } from './binaries'
import { compareVersions, isValidVersion } from './utils/versions'


export async function version(): Promise<void> {
  const v1 = await pkgVersion()
  const v2 = await goplsVersion() || 'unknown'

  window.showMessage(`Version: coc-go ${v1}; gopls ${v2}`, 'more')
}

export async function installGopls(client: LanguageClient): Promise<void> {
  await installGoBin(GOPLS, true, goplsVersion)

  if (client.needsStop()) {
    await client.stop()
    client.restart()
  }
}

export async function checkGopls(client: LanguageClient, mode: 'ask' | 'inform' | 'install'): Promise<void> {

  const [current, latest] = await Promise.all([
    goplsVersion(),
    checkLatestTag("golang/tools", /^gopls\//),
  ])

  try {
    let install = false
    switch (compareVersions(latest, current)) {
      case 0:
        window.showMessage(`[gopls] up-to-date: ${current}`, 'more')
        break
      case 1:
        switch (mode) {
          case 'install':
            install = true
            break
          case 'ask':
            install = await window.showPrompt(`[gopls] Install update? ${current} => ${latest}`)
            break
          case 'inform':
            window.showMessage(`[gopls] update available: ${current} => ${latest}`)
            break
        }

        break
      case -1:
        window.showMessage(`[gopls] current: ${current} | latest: ${latest}`, 'more')
        break
    }

    if (install) {
      await installGopls(client)
    }
  } catch (e) {
    window.showMessage(e.toString(), 'error')
  }
}

async function pkgVersion(): Promise<string> {
  try {
    const pkgPath = path.resolve(__dirname, '..', 'package.json')
    const pkgContent = await fs.promises.readFile(pkgPath, 'utf8')
    return JSON.parse(pkgContent).version
  } catch (err) {
    console.error(err)
  }

  return ''
}


async function goplsVersion(): Promise<string> {
  const [, versionOut] = await runGoTool("gopls", ["version"])

  const m = versionOut.trim().match(/\s{4}golang\.org\/x\/tools\/gopls@(v?\d+\.\d+\.\d+) .*/)
  if (m && isValidVersion(m[1])) {
    return m[1].replace(/^v/, '')
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

export async function installImpl(): Promise<void> {
  await installGoBin(IMPL, true)
}

export async function installTools(): Promise<void> {
  for (const tool of TOOLS) {
    await installGoBin(tool, true)
  }
}


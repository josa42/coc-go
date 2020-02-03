import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { workspace } from 'coc.nvim'
import which from 'which'
import { configDir } from './config'

////////////////////////////////////////////////////////////////////////////////

export async function installGoBin(source: string, force = false): Promise<boolean> {
  const name = goBinName(source)

  if (!force && await goBinExists(name)) {
    return true
  }

  const statusItem = workspace.createStatusBarItem(90, { progress: true })
  statusItem.text = `Installing '${name}'`
  statusItem.show()

  const success = await goRun(`get ${source}@latest`)

  if (success) {
    workspace.showMessage(`Installed '${name}'`)
  } else {
    workspace.showMessage(`Failed to install '${name}'`, 'error')
  }

  statusItem.hide()
  return success
}

export async function goBinPath(source: string): Promise<string> {
  const name = goBinName(source)
  return path.join(await configDir('bin'), name)
}

export async function runGoTool(name: string, args: string[] = []): Promise<number> {
  const bin = await goBinPath(name)
  return new Promise((resolve): void => { spawn(bin, args).on('close', (code) => resolve(code)) })
}

export async function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve): void => { which(command, (err) => resolve(err == null)) })
}

////////////////////////////////////////////////////////////////////////////////

async function goBinExists(source: string): Promise<boolean> {
  const name = goBinName(source)
  const bin = await goBinPath(name)
  return new Promise((resolve): void => fs.open(bin, 'r', (err) => resolve(err === null)))
}

async function goRun(args: string): Promise<boolean> {
  const gopath = await configDir('tools')
  const gobin = await configDir('bin')
  const cmd = `env GOBIN=${gobin} GOPATH=${gopath} go ${args}`

  try {
    await workspace.runCommand(cmd, gopath)
  } catch (ex) {
    workspace.showMessage(ex)
    return false
  }

  return true
}

function goBinName(source: string): string {
  return source.replace(/\/\.\.\.$/, '').split('/').pop()
}


import path from 'path'
import fs from 'fs'
import {spawn} from 'child_process'
import {workspace} from 'coc.nvim'
import which from 'which'
import {configDir} from './config'

export async function installGoBin(source: string, force: boolean = false) {
  const name = goBinName(source)
  const bin = await goBinPath(name)

  if (!force && await goBinExists(name)) {
    return
  }

  return (
    await goRun(`get -d -u ${source}`) &&
    await goRun(`build -o ${bin} ${source}`)
  )
}

export async function goBinPath(source: string): Promise<string> {
  const name = goBinName(source)
  return path.join(await configDir('bin'), name)
}

export async function runGoTool(name: string, args: string[] = []): Promise<Number> {
  const bin = await goBinPath(name)
  return new Promise(resolve => spawn(bin, args).on('close', (code) => resolve(code)))
}

export async function commandExists(command: string): Promise<boolean> {
  return new Promise(resolve => which(command, (err, _: string) => resolve(err == null)))
}

async function goBinExists(source: string): Promise<boolean> {
  const name = goBinName(source)
  const bin = await goBinPath(name)
  return new Promise(resolve => fs.open(bin, 'r', (err, _) => resolve(err === null)))
}

async function goRun(args: string): Promise<boolean> {
  const gopath = await configDir('tools')

  const cmd = `env GOPATH=${gopath} go ${args}`
  const res = await workspace.runTerminalCommand(cmd)

  return res.success
}

function goBinName(source: string): string {
  return source.split('/').pop()
}


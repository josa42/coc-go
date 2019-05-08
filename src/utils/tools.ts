import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process';
import { workspace } from 'coc.nvim'
import which from 'which'
import { configDir } from './config'

export async function installGoTool(name: string, force: boolean = false) {
  const bin = await goToolBin(name)

  if (!force && await goToolExists(name)) {
    return
  }

  return (
    await goRun(`get -d -u golang.org/x/tools/cmd/${name}`) &&
    await goRun(`build -o ${bin} golang.org/x/tools/cmd/${name}`)
  )
}

export async function goToolBin(name: string): Promise<string> {
  return path.join(await configDir('bin'), name)
}


export async function goToolExists(name: string): Promise<boolean> {
  const bin = await goToolBin(name)
  return new Promise(resolve => fs.open(bin, 'r', (err, _) => resolve(err === null)));
}

export async function runGoTool(name: string, args: string[] = []): Promise<Number> {
  const bin = await goToolBin(name)
  return new Promise(resolve => spawn(bin, args).on('close', (code) => resolve(code)))
}

async function goRun(args: string): Promise<boolean> {
  const gopath = await configDir('tools')

  const cmd = `GOPATH=${gopath}; go ${args}`
  const res = await workspace.runTerminalCommand(cmd)

  return res.success
}

export async function commandExists(command: string): Promise<boolean> {
  return new Promise(resolve => which(command, (err, _: string) => resolve(err == null)));
}



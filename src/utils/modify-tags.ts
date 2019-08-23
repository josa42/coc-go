import cp = require('child_process')
import { TextDocument, Position, TextEdit } from 'vscode-languageserver-protocol'
import { workspace } from 'coc.nvim'

import { GoTagsConfig } from './config'
import { goBinPath } from './tools'
import { GOMODIFYTAGS } from '../binaries'

interface Params {
  prompt?: boolean
  tags?: string[]
  selection?: "line" | "struct"
}

interface ClearParams {
  selection?: "line" | "struct"
}

////////////////////////////////////////////////////////////////////////////////

export async function addTags(document: TextDocument, params: Params = {}) {
  const config = workspace.getConfiguration().get('go.tags', {}) as GoTagsConfig

  let tags = (params.tags && params.tags.length > 0)
    ? params.tags.join(',')
    : (config.tags || 'json')
  let options = (config.options || config.options === "")
    ? config.options
    : 'json=omitempty'
  let transform = (config.transform || "snakecase")

  if (params.prompt) {
    tags = await workspace.requestInput('Enter comma separated tag names', tags)
    if (!tags) {
      return
    }

    options = await workspace.requestInput('Enter comma separated options', options)
  }

  await runGomodifytags(document, [
    '-add-tags', tags.replace(/ +/g, ''),
    '-add-options', (options || ""),
    '-transform', transform,
    ...(await offsetArgs(document, (params.selection || "struct")))
  ])
}

export async function removeTags(document: TextDocument, params: Params = {}) {
  const config = workspace.getConfiguration().get('go.tags', {}) as GoTagsConfig

  let tags = (params.tags && params.tags.length > 0)
    ? params.tags.join(',')
    : (config.tags || 'json')

  if (params.prompt) {
    tags = await workspace.requestInput('Enter comma separated tag names', tags)
    if (!tags) {
      return
    }
  }

  await runGomodifytags(document, [
    '-remove-tags', (tags || "json"),
    '-clear-options',
    ...(await offsetArgs(document, (params.selection || "struct")))
  ])
}

export async function clearTags(document: TextDocument, params: ClearParams = {}) {
  await runGomodifytags(document, [
    '-clear-tags',
    '-clear-options',
    ...(await offsetArgs(document, (params.selection || "struct")))
  ])
}

////////////////////////////////////////////////////////////////////////////////


async function runGomodifytags(document: TextDocument, args: string[]) {

  const fileName = document.uri.replace(/^file:\/\//, '')

  args.push(
    '-modified',
    '-file', fileName,
    '-format', 'json'
  )


  const input = fileArchive(fileName, document.getText())
  const edit = await execGomodifytags(args, input)

  await workspace.applyEdit({ changes: { [document.uri]: [edit] } })
}

// Interface for the output from gomodifytags
interface GomodifytagsOutput {
  start: number
  end: number
  lines: string[]
}

async function execGomodifytags(args: string[], input: string): Promise<TextEdit> {

  const gomodifytags = await goBinPath(GOMODIFYTAGS)

  return new Promise((resolve, reject) => {
    const p = cp.execFile(gomodifytags, args, { env: {} }, async (err, stdout, stderr) => {
      if (err) {
        workspace.showMessage(`Cannot modify tags: ${stderr}`)

        return reject()
      }

      const mods = JSON.parse(stdout) as GomodifytagsOutput

      resolve({
        range: {
          start: { line: mods.start - 1, character: 0 },
          end: { line: mods.end, character: 0 }
        },
        newText: mods.lines.join("\n") + "\n"
      })
    })

    if (p.pid) {
      p.stdin.end(input)
    }
  })
}

function fileArchive(fileName: string, fileContents: string): string {
  return fileName + '\n' + Buffer.byteLength(fileContents, 'utf8') + '\n' + fileContents
}

// https://github.com/microsoft/vscode-go/blob/master/src/util.ts#L84
function byteOffsetAt(document: TextDocument, position: Position): string {
  const offset = document.offsetAt(position)
  const text = document.getText()
  return Buffer.byteLength(text.substr(0, offset)).toString()
}

async function offsetArgs(document: TextDocument, seletion: "struct" | "line"): Promise<string[]> {

  const cursor = await workspace.getCursorPosition()

  switch (seletion) {
    case "struct":
      return ['-offset', byteOffsetAt(document, cursor)]
    case "line":
      return ['-line', String(cursor.line+1)]
  }

  return []
}


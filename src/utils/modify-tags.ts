import cp = require('child_process')
import {TextDocument, Position, TextEdit} from 'vscode-languageserver-protocol'
import {workspace} from 'coc.nvim'

import {GoTagsConfig} from './config'
import {goBinPath} from './tools'
import {GOMODIFYTAGS} from '../binaries'

interface Params {
  prompt?: boolean
}

////////////////////////////////////////////////////////////////////////////////

export async function addTags(document: TextDocument, params: Params = {}) {
  const config = workspace.getConfiguration().get('go.tags', {}) as GoTagsConfig

  let tags = (config.tags || 'json')
  let options = (config.options || 'json=omitempty')
  let transform = (config.transform || "snakecase")

  if (params.prompt) {
    tags = await workspace.requestInput('Enter comma separated tag names', tags)
    if (!tags) {
      return
    }

    options = await workspace.requestInput('Enter comma separated options', options)
  }

  await runGomodifytags(document, [
    '-add-tags', tags,
    '-add-options', (options || ""),
    '-transform', transform
  ])
}

export async function removeTags(document: TextDocument, params: Params = {}) {
  const config = workspace.getConfiguration().get('go.tags', {}) as GoTagsConfig

  let tags = (config.tags || 'json')

  if (params.prompt) {
    tags = await workspace.requestInput('Enter comma separated tag names', tags)
    if (!tags) {
      return
    }
  }

  await runGomodifytags(document, [
    '-remove-tags', (tags || "json"),
    '-clear-options'
  ])
}

export async function clearTags(document: TextDocument) {
  await runGomodifytags(document, [
    '-clear-tags',
    '-clear-options'
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

  const byteOff = byteOffsetAt(document, await workspace.getCursorPosition())
  args.push('-offset', String(byteOff))

  const input = fileArchive(fileName, document.getText())
  const edit = await execGomodifytags(args, input)

  await workspace.applyEdit({changes: {[document.uri]: [edit]}})
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
    const p = cp.execFile(gomodifytags, args, {env: {}}, async (err, stdout, stderr) => {
      if (err) {
        workspace.showMessage(`Cannot modify tags: ${stderr}`)

        return reject()
      }

      const mods = <GomodifytagsOutput>JSON.parse(stdout)

      resolve({
        range: {
          start: {line: mods.start - 1, character: 0},
          end: {line: mods.end, character: 0}
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
function byteOffsetAt(document: TextDocument, position: Position): number {
  const offset = document.offsetAt(position)
  const text = document.getText()
  return Buffer.byteLength(text.substr(0, offset))
}




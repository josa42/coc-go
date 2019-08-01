import cp = require('child_process')
import {TextDocument, Position} from 'vscode-languageserver-protocol'
import {workspace} from 'coc.nvim'

// Interface for the output from gomodifytags
interface GomodifytagsOutput {
  start: number
  end: number
  lines: string[]
}

interface modifyStructTagsArgs {
  action: 'add' | 'remove'
  name?: string
  document: TextDocument
}

// TODO add configuration:
// -> https://github.com/microsoft/vscode-go/blob/master/package.json#L1195
// -> https://github.com/microsoft/vscode-go/blob/master/src/goModifytags.ts

export async function modifyTags(args: modifyStructTagsArgs) {
  const {action, name, document} = args

  const fileName = document.uri.replace(/^file:\/\//, '')
  const fileContents = document.getText()

  const gomodifytags = '/Users/josa/go/bin/gomodifytags'
  const cmdArgs = [
    '-modified',
    '-file', fileName,
    `-${action}-tags`, 'yaml',
    '-format', 'json'
  ]

  if (name != null) {
    cmdArgs.push(
      '-struct', name
    )
  } else {
    const byteOff = byteOffsetAt(document, await workspace.getCursorPosition())
    cmdArgs.push(
      '-offset', String(byteOff)
    )
  }

  // workspace.showMessage(JSON.stringify(cmdArgs))

  const input = fileArchive(fileName, fileContents)
  const p = cp.execFile(gomodifytags, cmdArgs, {env: {}}, (err, stdout, stderr) => {
    if (err && (<any>err).code === 'ENOENT') {
      // promptForMissingTool('gomodifytags')
      workspace.showMessage(err.message)
      return
    }
    if (err) {
      workspace.showMessage(`Cannot modify tags: ${stderr}`)
      return
    }

    const mods = <GomodifytagsOutput>JSON.parse(stdout)
    workspace.applyEdit({
      changes: {
        [document.uri]: [{
          range: {
            start: {line: mods.start - 1, character: 0},
            end: {line: mods.end, character: 0}
          },
          newText: mods.lines.join("\n") + "\n"
        }]
      }
    })
  })

  if (p.pid) {
    p.stdin.end(input)
  }
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




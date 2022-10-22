'use strict'
import {
  ListContext,
  CancellationToken,
  ListItem,
  Neovim,
  LanguageClient,
  window,
  ListAction,
  workspace,
  Position,
  Range,
  ListArgument,
  BasicList,
  SymbolInformation,
} from 'coc.nvim'

import {
  SymbolKind,
  DocumentSymbol,
} from 'vscode-languageserver-protocol'

import {
  runGoImpl
} from './impl'

import * as lsp from './lsp'

import { activeTextDocument } from '../editor'
import { TextEdit } from 'vscode-languageserver-textdocument'

class GoimplItem {
  public name: String

  constructor(name: String) {
    this.name = name
  }
}
export default class Goimpl extends BasicList {
  public defaultAction: string = 'goimpl'
  public actions: ListAction[] = []
  public readonly interactive = true
  public readonly description = 'search workspace interfaces to generate go interface stub'
  public readonly detail = 'worked with go struct'
  private cwd: string
  public name: string = 'goimpl'
  private client: LanguageClient

  private cursorSymbol: DocumentSymbol
  private args: { [key: string]: string | boolean }

  constructor(nvim: Neovim, client: LanguageClient) {
    super(nvim)
    this.client = client
    let executeCtx = this;
    this.actions.push({
      name: 'goimpl',
      execute: async item => {
        if (Array.isArray(item)) {
          return
        }
        const implSymbol = item.data as SymbolInformation
        const cursorSymbol = executeCtx.cursorSymbol

        const selfName = cursorSymbol.name[0].toLowerCase()
        let receiver = `${selfName} *${cursorSymbol.name}`

        receiver = await window.requestInput('Enter receiver and interface [f *File io.Closer]', receiver)
        if (receiver == null || receiver.length == 0) {
          window.showMessage("No input detected! Aborting.", "warning")
          return
        }
        const document = await activeTextDocument()
        const interfaceFile = baseName(document.uri)

        let edit: TextEdit;
        try {
          edit = await runGoImpl(
            document,
            ['-dir', interfaceFile, receiver, interfaceFullName(implSymbol)],
            { line: cursorSymbol.range.end.line + 1, character: 0 },
          )
        } catch (err) {
          if (typeof err === 'string' && err.includes('unrecognized interface:')) {
            // the interface may in the main package
            // try with no containerName
            edit = await runGoImpl(
              document,
              ['-dir', interfaceFile, receiver, implSymbol.name],
              { line: cursorSymbol.range.end.line + 1, character: 0 },
            )
          } else {
            throw err
          }
        }
        if (edit.newText.trim() == '') {
          return
        }
        await workspace.applyEdit({ changes: { [document.uri]: [edit] } })
        executeCtx.args = null
        executeCtx.cursorSymbol = null
      }
    })
  }

  public async loadItems(context: ListContext, token: CancellationToken): Promise<ListItem[]> {
    if (token.isCancellationRequested) return []
    if (!this.cursorSymbol) {
      const document = await activeTextDocument()
      let docSymbols = await lsp.provideDocumentSymbols(this.client, document, token) as DocumentSymbol[]
      const cursorPos = await window.getCursorPosition()
      for (const s of docSymbols) {
        if (inRange(cursorPos, s.range)) {
          this.cursorSymbol = s
          break
        }
      }
      if (this.cursorSymbol.kind != SymbolKind.Struct) {
        throw new Error('cursor symbol is not a struct')
      }
    }
    let { input } = context
    this.cwd = context.cwd
    if (!context.options.interactive) {
      throw new Error('Symbols only works on interactive mode')
    }
    let symbols = await lsp.provideWorkspaceSymbols(this.client, input, token)
    symbols = symbols ? symbols : []
    symbols = symbols.filter((s) => { return s.kind == SymbolKind.Interface })
    let items: ListItem[] = []
    for (let s of symbols) {
      const fullName = interfaceFullName(s)
      items.push({
        label: fullName,
        filterText: fullName,
        location: s.location,
        data: s,
      })
    }
    return items
  }

}


function interfaceFullName(s: SymbolInformation): string {
  let idx = s.name.lastIndexOf('.')
  let name: string;
  if (idx != -1) {
    name = s.name.slice(idx + 1, s.name.length)
  } else {
    name = s.name
  }
  return `${s.containerName}.${name}`
}

function inRange(position: Position, range: Range): Boolean {
  return position.line >= range.start.line
    && position.line <= range.end.line
}

function baseName(pathUri: string): string {
  pathUri = pathUri.replace('file://', '')
  pathUri = pathUri.slice(0, pathUri.lastIndexOf('/'))
  return pathUri
}

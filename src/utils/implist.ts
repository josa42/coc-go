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
  public options: ListArgument[] = [{
    name: '-n, -noptr',
    description: 'Do not generate pointer receiver.',
    hasValue: false
  }]
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
        const cursorSymbol = executeCtx.cursorSymbol
        const selfName = cursorSymbol.name[0].toLowerCase()
        let receiver: String
        if (executeCtx.args['noptr']) {
          receiver = `${selfName} ${cursorSymbol.name}`
        } else {
          receiver = `${selfName} *${cursorSymbol.name}`
        }
        const implData = item.data as GoimplItem
        const document = await activeTextDocument()
        const edit = await runGoImpl(
          document,
          [receiver as string, implData.name as string],
          { line: cursorSymbol.range.end.line + 1, character: 0 },
        )
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
        if (this.inRange(cursorPos, s.range)) {
          this.cursorSymbol = s
          break
        }
      }
      if (this.cursorSymbol.kind != SymbolKind.Struct) {
        throw new Error('cursor symbol is not a struct')
      }
    }
    if (!this.args) {
      this.args = this.parseArguments(context.args)
    }
    let { input } = context
    this.cwd = context.cwd
    if (!context.options.interactive) {
      throw new Error('Symbols only works on interactive mode')
    }
    let symbols = await lsp.provideWorkspaceSymbols(this.client, input, token)
    symbols = symbols ?
      symbols.filter((s) => {
        return s.kind == SymbolKind.Interface
          // duplicate interface like  mime/multipart/formdata.go File.Reader 
          // it is io.Reader actually
          && !s.name.includes('.')
      })
      : [];
    let items: ListItem[] = []
    for (let s of symbols) {
      const fullName = this.interfaceFullName(s)
      items.push({
        label: fullName,
        filterText: fullName,
        location: s.location,
        data: new GoimplItem(fullName)
      })
    }
    return items
  }

  inRange(position: Position, range: Range): Boolean {
    return position.line >= range.start.line
      && position.line <= range.end.line
  }

  interfaceFullName(s: SymbolInformation): string {
    return `${s.containerName}.${s.name}`
  }

}


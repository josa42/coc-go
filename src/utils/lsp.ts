import {
  CancellationToken,
  LanguageClient,
  window,
  TextDocument,
} from 'coc.nvim'

import {
  WorkspaceSymbolRequest,
  DocumentSymbolRequest,
  DocumentSymbolParams,
  SymbolInformation,
  DocumentSymbol,
} from 'vscode-languageserver-protocol'


export async function provideWorkspaceSymbols(client: LanguageClient, query: string, token: CancellationToken): Promise<SymbolInformation[]> {
  query = query || ''
  return client.
    sendRequest(WorkspaceSymbolRequest.type, { query }, token).
    then(
      res => {
        return res
      },
      error => {
        window.showMessage(error, "error")
        return []
      }
    )
}

export async function provideDocumentSymbols(client: LanguageClient, document: TextDocument, token: CancellationToken): Promise<DocumentSymbol[] | SymbolInformation[]> {
  let param: DocumentSymbolParams = { textDocument: { uri: document.uri } };
  return client.
    sendRequest(DocumentSymbolRequest.type, param, token).
    then(
      res => {
        return res
      },
      error => {
        window.showMessage(error, "error")
        return [] as SymbolInformation[]
      }
    )
}

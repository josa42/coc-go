import {
  CancellationToken,
  LanguageClient,
  TextDocument,
  SymbolInformation,
  RequestType,
  DocumentSymbol,
} from 'coc.nvim'

import {
  DocumentSymbolParams,
  WorkspaceSymbolParams,
} from 'vscode-languageserver-protocol'


namespace WorkspaceSymbolRequest {
  export const method = 'workspace/symbol'
  export const type = new RequestType<WorkspaceSymbolParams, SymbolInformation[] | null, void>(method);
}

namespace DocumentSymbolRequest {
  export const method = 'textDocument/documentSymbol'
  export const type = new RequestType<DocumentSymbolParams, DocumentSymbol[] | SymbolInformation[] | null, void>(method)
}

export async function provideWorkspaceSymbols(client: LanguageClient, query: string, token: CancellationToken): Promise<SymbolInformation[]> {
  query = query || ''
  return client.
    sendRequest(WorkspaceSymbolRequest.type, { query }, token).
    then(
      res => {
        return res
      },
      error => {
        return client.handleFailedRequest(WorkspaceSymbolRequest.type, token, error, [])
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
        return client.handleFailedRequest(DocumentSymbolRequest.type, token, error, [])
      }
    )
}

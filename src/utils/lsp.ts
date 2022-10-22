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
  ResponseError,
  ErrorCodes,
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
        return handleLspError(error, [])
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
        return handleLspError(error, [] as SymbolInformation[])
      }
    )
}

export function handleLspError<T>(error: any, defaultValue: T): T {
  // TODO: not work here, error instanceof != ResponseError 22-10-22 //
  // maybe miss match dependencies version
  if (error instanceof ResponseError) {
    if (error.code === ErrorCodes.RequestCancelled) {
      return defaultValue
    }
  }
  // TODO: ignore error now 22-10-22 //
  //window.showMessage(error, "error")
  return defaultValue
}

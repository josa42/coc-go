import { DocumentSelector, ExtensionContext, InlayHint, InlayHintsProvider, LanguageClient, Range, TextDocument, languages } from 'coc.nvim'

export async function register(context: ExtensionContext, client: LanguageClient) {
  await client.onReady()

  const documentSelector: DocumentSelector = [{ language: 'go', scheme: 'file' }]
  context.subscriptions.push(
    languages.registerInlayHintsProvider(documentSelector, new GoplsInlayHintsProvider(client))
  )
}

export class GoplsInlayHintsProvider implements InlayHintsProvider {
  client: LanguageClient
  constructor(client: LanguageClient) {
    this.client = client
  }

  async provideInlayHints(
    document: TextDocument,
    range: Range,
  ) {
    const inlayHints: InlayHint[] = []

    const response: InlayHint[] = await this.client.sendRequest('textDocument/inlayHint', {
      textDocument: { uri: document.uri },
      range
    })

    if (response) {
      response.forEach((r) => {
        const hint: InlayHint = {
          label: r.label,
          position: r.position,
          kind: r.kind ?? r.kind,
          paddingLeft: r.paddingLeft ? r.paddingLeft : undefined,
          paddingRight: r.paddingRight ? r.paddingRight : undefined,
          textEdits: r.textEdits ? r.textEdits : undefined,
          tooltip: r.tooltip ? r.tooltip : undefined,
          data: r.data ? r.data : undefined,
        }

        inlayHints.push(hint)
      })
    }

    return inlayHints
  }
}

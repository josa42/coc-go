import { Document, workspace } from 'coc.nvim'
import { TextDocument } from 'vscode-languageserver-textdocument'

export async function activeDocument(...filetypes: string[]): Promise<Document> {
  filetypes = filetypes.length ? filetypes : ['go']
  const doc = await workspace.document

  if (!filetypes.includes(doc.filetype)) {
    throw `Not a ${filetypes.join(' or ')} document`
  }

  return doc
}

export async function activeTest() {
  let doc = await activeDocument()
  if (!doc.uri.endsWith('_test.go')) {
    doc = await workspace.loadFile(doc.uri.replace(/\.go$/, '_test.go'))
  }

  return doc
}

export async function activeTextDocument(...filetypes: string[]): Promise<TextDocument> {
  return (await activeDocument(...filetypes)).textDocument
}

export async function activeURI(...filetypes: string[]): Promise<string> {
  return (await activeDocument(...filetypes)).uri
}

export async function goMod(): Promise<Document> {
  const doc = await workspace.document

  return doc.filetype === 'gomod'
    ? doc
    : await workspace.loadFile(`${rootURI()}/go.mod`)
}

export async function goModURI(): Promise<string> {
  const doc = await workspace.document

  return doc.filetype === 'gomod'
    ? doc.uri
    : `${rootURI()}/go.mod`
}

export async function goplsModURI(): Promise<string> {
  const doc = await workspace.document

  return doc.uri.endsWith('gopls.mod')
    ? doc.uri
    : `${rootURI()}/gopls.mod`
}

export function rootURI(): string {
  return `file://${workspace.root}`
}

export function getTests(doc: Document): string[] {
  const expr = /^func ((?:Test|Benchmark)\w+)\s*\([tb] \*testing\.[TB]\).*/
  return doc.getLines()
    .filter((line: string) => line.match(expr))
    .map((line) => line.replace(expr, '$1')) as string[]
}

export async function getDependencies(): Promise<string[]> {
  const doc = await goMod()
  const lines = doc.getDocumentContent().match(/require \(\n([\s\S]+)\n\)/)

  return (lines && lines[1] || '')
    .split('\n')
    .map((l) => l.replace(/^\s+(\S+).*/, '$1'))
    .filter((l) => l.trim())
}

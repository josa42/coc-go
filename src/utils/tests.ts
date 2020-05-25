import { workspace } from 'coc.nvim'
import { TextDocument } from 'vscode-languageserver-protocol'
import { execTool } from './tools'
import { GOTESTS } from '../binaries'
import { GoTestsConfig } from './config'

////////////////////////////////////////////////////////////////////////////////

export async function generateTestsAll(document: TextDocument): Promise<void> {
  if (isTest(document)) {
    workspace.showMessage("Document is a test file", "error")
    return
  }
  await runGotests(document, ["-all"]) && await openTests(document)
}

export async function generateTestsExported(document: TextDocument): Promise<void> {
  if (isTest(document)) {
    workspace.showMessage("Document is a test file", "error")
    return
  }
  await runGotests(document, ["-exported"]) && await openTests(document)
}

export async function toogleTests(document: TextDocument): Promise<void> {
  const targetURI = isTest(document)
    ? sourceURI(document)
    : testURI(document)

  return workspace.openResource(targetURI)
}

////////////////////////////////////////////////////////////////////////////////

async function openTests(document: TextDocument): Promise<void> {
  return workspace.openResource(testURI(document))
}

function isTest(document: TextDocument): boolean {
  return document.uri.endsWith('_test.go')
}

function testURI(document: TextDocument): string {
  return document.uri.replace(/(_test)?\.go$/, '_test.go')
}

function sourceURI(document: TextDocument): string {
  return document.uri.replace(/(_test)?\.go$/, '.go')
}

async function runGotests(document: TextDocument, args: string[]): Promise<boolean> {

  const config = workspace.getConfiguration().get('go.tests', {}) as GoTestsConfig

  args.push(...(config.generateFlags || []), '-w', document.uri.replace(/^file:\/\//, ''))
  try {
    const stdout = await execTool(GOTESTS, args)
    workspace.showMessage(stdout || "")

    return true

  } catch (err) {
    workspace.showMessage(`Error: ${err}`, "error")
    return false
  }
}

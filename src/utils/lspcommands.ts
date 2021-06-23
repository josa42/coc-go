import { commands, window } from 'coc.nvim'
import { activeTextDocument } from '../editor'
import { extractFunctionName } from './tests'

export async function goplsTidy() {
  const doc = await activeTextDocument()
  await commands.executeCommand('gopls.tidy', { URIs: [doc.uri] })
}

export async function goplsRunTests() {
  const doc = await activeTextDocument()
  if (!doc.uri.endsWith("_test.go")) {
    window.showMessage("Document is not a test file", "error")
    return
  }

  const { line } = await window.getCursorPosition()
  const text = doc.getText({
    start: { line, character: 0 },
    end: { line, character: Infinity },
  })

  window.showMessage(text)

  const funcName = extractFunctionName(text)
  if (!funcName) {
    window.showMessage("No function found", "error")
    return
  }

  const tests: string[] = []
  const bench: string[] = []
  if (funcName.startsWith("Test")) {
    tests.push(funcName)
  } else if (funcName.startsWith("Benchmark")) {
    bench.push(funcName)
  }

  if (tests.length == 0 && bench.length === 0) {
    window.showMessage("No tests or benchmarks found in current line")
    return
  }

  await commands.executeCommand("gopls.run_tests", {
    // The test file containing the tests to run.
    "URI": doc.uri,
    // Specific test names to run, e.g. TestFoo.
    "Tests": tests,
    // Specific benchmarks to run, e.g. BenchmarkFoo.
    "Benchmarks": bench,
  })
}


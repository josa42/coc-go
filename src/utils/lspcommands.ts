import {
  commands, IList,
  ListAction,
  ListContext,
  ListItem, listManager, TextDocument, window, workspace
} from 'coc.nvim'
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

  const funcName = extractFunctionName(text)
  if (!funcName) {
    // if no function if found, put all functions to list so that user can choose what to execute
    listTests(doc)
    return
  }

  window.showMessage(funcName)
  await runGoplsTests(doc.uri, funcName)
}

async function runGoplsTests(docUri: string, ...funcNames: string[]) {
  const tests: string[] = []
  const bench: string[] = []
  funcNames.forEach(funcName => {
    if (funcName.startsWith("Test")) {
      tests.push(funcName)
    } else if (funcName.startsWith("Benchmark")) {
      bench.push(funcName)
    }
  })

  if (tests.length === 0 && bench.length === 0) {
    window.showMessage("No tests or benchmarks found in current line")
    return
  }

  window.showMessage("Running " + [...tests, ...bench].join(", "))
  await commands.executeCommand("gopls.run_tests", {
    // The test file containing the tests to run.
    "URI": docUri,
    // Specific test names to run, e.g. TestFoo.
    "Tests": tests,
    // Specific benchmarks to run, e.g. BenchmarkFoo.
    "Benchmarks": bench,
  })
}

class GoTests implements IList {
  public readonly name = 'gotests'
  public readonly description = 'go tests & benchmarks in current file'
  public readonly defaultAction = 'run'
  public actions: ListAction[] = []

  constructor(private docUri: string, private tests: string[]) {
    this.actions.push({
      name: 'run',
      execute: async (item: ListItem) => {
        if (Array.isArray(item)) {
          const funcs = item.map(i => i.filterText)
          await runGoplsTests(this.docUri, ...funcs)
        } else {
          await runGoplsTests(this.docUri, ...item.data)
        }
      }
    })
  }

  public async loadItems(_context: ListContext): Promise<ListItem[]> {
    const items = this.tests.map<ListItem>(t => ({
      label: t,
      filterText: t,
      data: [t],
    }))
    if (this.tests.length > 1) {
      items.unshift({
        label: "all",
        filterText: "all",
        data: this.tests,
      })
    }
    return items
  }

  public dispose() {
    console.debug("clearing gotest list")
    this.tests = []
  }
}

// const goTestList = new GoTests()

function listTests(doc: TextDocument) {
  const content = doc.getText()
  const matches: string[] = []

  const re = /^func\s+((Test|Benchmark)\w+)\s?\(/gm
  let match: RegExpExecArray;
  while ((match = re.exec(content)) !== null) {
    matches.push(match[1])
  }
  if (matches.length !== 0) {
    const dispose = listManager.registerList(new GoTests(doc.uri, matches))
    workspace.registerAutocmd({
      event: "BufWinLeave",
      callback: () => {
        console.debug("disposing gotest list on BufWinLeave")
        dispose.dispose()
      }
    })
    // @ts-ignore
    listManager.start(["gotests"])
  } else {
    window.showMessage("No tests found in current buffer")
  }
}


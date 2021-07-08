import {
  commands,
  IList,
  ListAction,
  ListContext,
  ListItem, SymbolInformation, window, workspace
} from 'coc.nvim'
import { activeTextDocument } from '../editor'

export async function goplsTidy() {
  const doc = await workspace.document
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

  const re = /^func\s+((Test|Benchmark)\w+)\s?\(/gm
  const m = re.exec(text)
  if (m && m[1]) {
    window.showMessage(m[1])
    await runGoplsTests(doc.uri, m[1])
    return
  }
  // if no function if found, put all functions to list so that user can choose what to execute
  workspace.nvim.command('CocList gotests', true)
}

export async function goplsListKnownPackages() {
  workspace.nvim.command('CocList goknownpackages', true)
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
    window.showMessage("No tests or benchmarks found in current file")
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

type CocDocumentSymbol = {
  kind: string
  text: string
}

type GoTestsData = {
  docUri: string
  tests: string[]
}

type GoTestsListItem = { data: GoTestsData } & Omit<ListItem, 'data'>

export class GoTestsList implements IList {
  public readonly name = 'gotests'
  public readonly description = 'go tests & benchmarks in current file'
  public readonly defaultAction = 'run'
  public actions: ListAction[] = []

  constructor() {
    this.actions.push({
      name: 'run',
      execute: async (item: GoTestsListItem) => {
        const { docUri, tests } = item.data
        await runGoplsTests(docUri, ...tests)
      }
    }, {
      name: 'yank as go test',
      execute: async (item: GoTestsListItem) => {
        const { tests } = item.data
        if (tests.length === 0) {
          return
        }
        // hacky way to retrieve current package qualified name
        const symbol: SymbolInformation[] = await workspace.nvim.call('CocAction', ["getWorkspaceSymbols", `'${tests[0]}`])
        if (symbol.length === 0) {
          window.showMessage("can't retrieve go package for current file")
          return
        }
        const pkg = symbol[0].containerName
        const content = `go test ${pkg} -run '^${tests.join("|")}$' -timeout 30s -v -count 1`
        console.log(content)
        await workspace.nvim.command(`let @+ = "${content}"`, true)
        window.showMessage("yanked to + register")
      }
    }, {
      name: 'yank test name',
      execute: async (item: GoTestsListItem) => {
        const { tests } = item.data
        const content = tests.join(" ")
        await workspace.nvim.command(`let @+ = "${content}"`, true)
        window.showMessage("yanked to + register")
      }
    })
  }

  public async loadItems(context: ListContext): Promise<ListItem[]> {
    const symbols: CocDocumentSymbol[] = await workspace.nvim.call('CocAction', ['documentSymbols', context.buffer.id])
    const tests = symbols.filter(s => s.kind === 'Function' && (s.text.startsWith("Test") || s.text.startsWith("Benchmark")))
    const doc = workspace.getDocument(context.buffer.id)

    const items = tests.map<GoTestsListItem>(t => ({
      label: t.text,
      filterText: t.text,
      data: { docUri: doc.uri, tests: [t.text] },
    }))
    if (tests.length > 1) {
      items.unshift({
        label: "all",
        filterText: "all",
        // we need to remember the docUri in case the list is resumed. At this point the doc would be a different one
        data: { docUri: doc.uri, tests: tests.map(t => t.text) }
      })
    }
    return items
  }

  public dispose() {
    console.debug("clearing gotest list")
  }
}

export class GoKnownPackagesList implements IList {
  public readonly name = 'goknownpackages'
  public readonly description = 'go known packages'
  public readonly defaultAction = 'import'
  public actions: ListAction[] = []

  constructor() {
    this.actions.push({
      name: 'import',
      execute: async (item: ListItem) => {
        const doc = await activeTextDocument()
        await commands.executeCommand("gopls.add_import", {
          // The test file containing the tests to run.
          "URI": doc.uri,
          "ImportPath": item.filterText,
        })
      }
    }, {
      name: 'yank',
      execute: async (item: ListItem) => {
        await workspace.nvim.command(`let @" = "${item.filterText}"`, true)
        window.showMessage("yanked to \" register")
      }
    })
  }

  public async loadItems(_context: ListContext): Promise<ListItem[]> {
    const doc = await activeTextDocument()
    const result: { Packages: string[] } = await commands.executeCommand('gopls.list_known_packages', { URI: doc.uri })
    if (!result || !result.Packages || result.Packages.length === 0) {
      // window.showMessage("No known packages found", "error")
      return []
    }
    const items = result.Packages.map<ListItem>(pkg => ({
      label: pkg,
      filterText: pkg,
    }))
    return items
  }

  public dispose() {
    console.debug("clearing goknownpackages list")
  }
}

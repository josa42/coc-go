import { window } from 'coc.nvim'
import { activeTest, activeURI, getDependencies, getTests, goModURI, goplsModURI, rootURI } from '../editor'
import { select } from './ui'
import * as gopls from './gopls'

export async function goplsAddDependency(dependency: string) {
  dependency = dependency || await window.requestInput('dependency')
  if (dependency) {
    await gopls.addDependency({
      URI: await goModURI(),
      GoCmdArgs: [dependency],
      AddRequire: false,
    })
  }
}

export async function goplsAddImport(path: string) {
  path = path || await window.requestInput('import')
	await gopls.addImport({
    URI: await activeURI('go', 'gomod'),
    ImportPath: path,
  })
}

export async function goplsGenerate(...flags: string[]) {
	await gopls.generate({
    Dir: rootURI(),
    Recursive: flags.includes('--recursive')
  })
}

export async function goplsGenerateGoplsMod() {
	await gopls.generateGoplsMod({ URI: await goplsModURI() })
}

export async function goplsGoGetPackage(pkg: string) {
  pkg = pkg || await window.requestInput('package')
	await gopls.goGetPackage({
    URI: await activeURI('go', 'gomod'),
    Pkg: pkg,
    AddRequire: true,
  })
}

export async function goplsRemoveDependency() {
  const [dep] = await select(await getDependencies())

  if (dep) {
    await gopls.removeDependency({
      URI: await goModURI(),
      ModulePath: dep,
      OnlyDiagnostic: false,
    })
  }
}

export async function goplsRunTests(...tests: string[]) {
  const doc = await activeTest()
  const all = tests.includes('--all')

  if (tests.length === 0 || all) {
    tests = getTests(doc)

    if (tests.length && !all) {
      tests = await select(tests, true)
    }
  }

  if (tests.length) {
    await gopls.runTests({
      URI: doc.uri,
      Tests: tests.filter((t) => t.startsWith('Test')),
      Benchmarks: tests.filter((t) => t.startsWith('Benchmark')),
    })
  }
}

export async function goplsTidy() {
  await gopls.tidy({
    URIs: [await activeURI('gomod')]
  })
}

export async function goplsUpdateGoSum() {
	await gopls.updateGoSum({
        URIs: [await activeURI('gomod')]
  })
}

export async function goplsVendor() {
	await gopls.vendor({
    URI: await activeURI()
  })
}

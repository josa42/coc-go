import { Range, commands } from 'coc.nvim'

// https://github.com/golang/tools/blob/master/gopls/doc/commands.md

interface AddDependencyArgs {
  // The go.mod file URI.
  URI: string
  // Additional args to pass to the go command.
  GoCmdArgs: string[]
  // Whether to add a require directive.
  AddRequire: boolean
 }

/**
 * ### **Add a dependency**
 * Identifier: `gopls.add_dependency`
 *
 * Adds a dependency to the go.mod file for a module.
 */
export function addDependency(args: AddDependencyArgs): Promise<void> {
  return commands.executeCommand('gopls.add_dependency', args)
}

interface AddImportArgs {
  // ImportPath is the target import path that should
  // be added to the URI file
  ImportPath: string
  // URI is the file that the ImportPath should be
  // added to
  URI: string
}

/**
 * ### **Add an import**
 * Identifier: `gopls.add_import`
 *
 * Ask the server to add an import path to a given Go file.  The method will
 * call applyEdit on the client so that clients don't have to apply the edit
 * themselves.
 */
export function addImport(args: AddImportArgs): Promise<void> {
  return commands.executeCommand('gopls.add_import', args)
}

interface ApplyFixArgs {
	// The fix to apply.
	Fix: string
	// The file URI for the document to fix.
	URI: string
	// The document range to scan for fixes.
	Range: Range
}

/**
 * ### **Apply a fix**
 * Identifier: `gopls.apply_fix`
 *
 * Applies a fix to a region of source code.
 */
export function applyFix(args: ApplyFixArgs): Promise<void> {
  return commands.executeCommand('gopls.apply_fix', args)
}

interface CheckUpgradesArgs {
  // The go.mod file URI.
  URI: string
  // The modules to check.
  Modules: string[]
 }

/**
 * ### **Check for upgrades**
 * Identifier: `gopls.check_upgrades`
 *
 * Checks for module upgrades.
 */
export function checkUpgrades(args: CheckUpgradesArgs): Promise<void> {
  return commands.executeCommand('gopls.check_upgrades', args)
}

/**
 * ### **Toggle gc_details**
 * Identifier: `gopls.gc_details`
 *
 * Toggle the calculation of gc annotations.
 */
export function gcDetails(args: string): Promise<void> {
  return commands.executeCommand('gopls.gc_details', args)
}

interface GenerateArgs {
  // URI for the directory to generate.
  Dir: string
  // Whether to generate recursively (go generate ./...)
  Recursive: boolean
 }

/**
 * ### **Run go generate**
 * Identifier: `gopls.generate`
 *
 * Runs `go generate` for a given directory.
 */
export function generate(args: GenerateArgs): Promise<void> {
  return commands.executeCommand('gopls.generate', args)
}

interface GenerateGoplsModArgs {
  // The file URI.
  URI: string
}

/**
 * ### **Generate gopls.mod**
 * Identifier: `gopls.generate_gopls_mod`
 *
 * (Re)generate the gopls.mod file for a workspace.
 */
export function generateGoplsMod(args: GenerateGoplsModArgs): Promise<void> {
  return commands.executeCommand('gopls.generate_gopls_mod', args)
}

interface GoGetPackageArgs {
  // Any document URI within the relevant module.
  URI: string
  // The package to go get.
  Pkg: string
  AddRequire: boolean
}

/**
 * ### **go get a package**
 * Identifier: `gopls.go_get_package`
 *
 * Runs `go get` to fetch a package.
 */
export function goGetPackage(args: GoGetPackageArgs): Promise<void> {
  return commands.executeCommand('gopls.go_get_package', args)
}

interface ListKnownPackagesArgs {
  // The file URI.
  URI: string
}

interface ListKnownPackagesResult {
  // Packages is a list of packages relative
  // to the URIArg passed by the command request.
  // In other words, it omits paths that are already
  // imported or cannot be imported due to compiler
  // restrictions.
  Packages: string[]
}

/**
 * ### **List known packages**
 * Identifier: `gopls.list_known_packages`
 *
 * Retrieve a list of packages that are importable from the given URI.
 */
export function listKnownPackages(args: ListKnownPackagesArgs): Promise<ListKnownPackagesResult> {
  return commands.executeCommand('gopls.list_known_packages', args)
}

interface RegenerateCgoArgs {
  // The file URI.
  URI: string
}

/**
 * ### **Regenerate cgo**
 * Identifier: `gopls.regenerate_cgo`
 *
 * Regenerates cgo definitions.
 */
export function regenerateCgo(args: RegenerateCgoArgs): Promise<void> {
  return commands.executeCommand('gopls.regenerate_cgo', args)
}

interface RemoveDependencyArgs {
  // The go.mod file URI.
  URI: string
  // The module path to remove.
  ModulePath: string
  OnlyDiagnostic: boolean
}

/**
 * ### **Remove a dependency**
 * Identifier: `gopls.remove_dependency`
 *
 * Removes a dependency from the go.mod file of a module.
 */
export function removeDependency(args: RemoveDependencyArgs): Promise<void> {
  return commands.executeCommand('gopls.remove_dependency', args)
}

interface RunTestsArgs {
  // The test file containing the tests to run.
  URI: string
  // Specific test names to run, e.g. TestFoo.
  Tests: string[]
  // Specific benchmarks to run, e.g. BenchmarkFoo.
  Benchmarks: string[]
}

/**
 * ### **Run test(s)**
 * Identifier: `gopls.run_tests`
 *
 * Runs `go test` for a specific set of test or benchmark functions.
 */
export function runTests(args: RunTestsArgs): Promise<void> {
  return commands.executeCommand('gopls.run_tests', args)
}

interface StartDebuggingArgs {
  // Optional: the address (including port) for the debug server to listen on.
  // If not provided, the debug server will bind to "localhost:0", and the
  // full debug URL will be contained in the result.
  //
  // If there is more than one gopls instance along the serving path (i.e. you
  // are using a daemon), each gopls instance will attempt to start debugging.
  // If Addr specifies a port, only the daemon will be able to bind to that
  // port, and each intermediate gopls instance will fail to start debugging.
  // For this reason it is recommended not to specify a port (or equivalently,
  // to specify ":0").
  //
  // If the server was already debugging this field has no effect, and the
  // result will contain the previously configured debug URL(s).
  Addr: string
}

/**
 * ### **Start the gopls debug server**
 * Identifier: `gopls.start_debugging`
 *
 * Start the gopls debug server if it isn't running, and return the debug
 * address.
 */
interface StartDebuggingResult {
  // The URLs to use to access the debug servers, for all gopls instances in
  // the serving path. For the common case of a single gopls instance (i.e. no
  // daemon), this will be exactly one address.
  //
  // In the case of one or more gopls instances forwarding the LSP to a daemon,
  // URLs will contain debug addresses for each server in the serving path, in
  // serving order. The daemon debug address will be the last entry in the
  // slice. If any intermediate gopls instance fails to start debugging, no
  // error will be returned but the debug URL for that server in the URLs slice
  // will be empty.
  URLs: string[]
}

export function startDebugging(args: StartDebuggingArgs): Promise<StartDebuggingResult> {
  return commands.executeCommand('gopls.start_debugging', args)
}

interface TidyArgs {
  // The file URIs.
  URIs: string[]
}

/**
 * ### **Run go mod tidy**
 * Identifier: `gopls.tidy`
 *
 * Runs `go mod tidy` for a module.
 */
export function tidy(args: TidyArgs): Promise<void> {
  return commands.executeCommand('gopls.tidy', args)
}


interface ToggleGcDetailsArgs {
  // The file URI.
  URI: string
}

/**
 * ### **Toggle gc_details**
 * Identifier: `gopls.toggle_gc_details`
 *
 * Toggle the calculation of gc annotations.
 */
export function toggleGcDetails(args: ToggleGcDetailsArgs): Promise<void> {
  return commands.executeCommand('gopls.toggle_gc_details', args)
}

interface UpdateGoSumArgs {
  // The file URIs.
  URIs: string[]
}

/**
 * ### **Update go.sum**
 * Identifier: `gopls.update_go_sum`
 *
 * Updates the go.sum file for a module.
 */
export function updateGoSum(args: UpdateGoSumArgs): Promise<void> {
  return commands.executeCommand('gopls.update_go_sum', args)
}

interface UpgradeDependencyArgs {
  // The go.mod file URI.
  URI: string
  // Additional args to pass to the go command.
  GoCmdArgs: string[]
  // Whether to add a require directive.
  AddRequire: boolean
}

/**
 * ### **Upgrade a dependency**
 * Identifier: `gopls.upgrade_dependency`
 *
 * Upgrades a dependency in the go.mod file for a module.
 */
export function upgradeDependency(args: UpgradeDependencyArgs): Promise<void> {
  return commands.executeCommand('gopls.upgrade_dependency', args)
}

interface VendorArgs {
  // The file URI.
  URI: string
}

/**
 * ### **Run go mod vendor**
 * Identifier: `gopls.vendor`
 *
 * Runs `go mod vendor` for a module.
 */
export function vendor(args: VendorArgs): Promise<void> {
  return commands.executeCommand('gopls.vendor', args)
}

interface WorksPaceMetadataResult {
  // All workspaces for this session.
  Workspaces: {
    Name: string
    ModuleDir: string
  }[]
}

/**
 * ### **Query workspace metadata**
 * Identifier: `gopls.workspace_metadata`
 *
 * Query the server for information about active workspaces.
 */
export function workspaceMetadata(): Promise<WorksPaceMetadataResult> {
  return commands.executeCommand('gopls.workspace_metadata', {})
}


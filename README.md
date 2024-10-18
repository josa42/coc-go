# coc-go

Go language server extension using [`gopls`](https://github.com/golang/go/wiki/gopls)
for [`coc.nvim`](https://github.com/neoclide/coc.nvim).

## Install

In your vim/neovim, run this command:

```
:CocInstall coc-go
```

## Features

See [`gopls`](https://github.com/golang/tools/blob/master/gopls/README.md)

## Commands

Additional to commands provided by gopls, this extensions provides these commands:

| Key                             | Description                                        |
|---------------------------------|----------------------------------------------------|
| **`go.gopls.tidy`**             | Run gopls.tidy LSP command                         |
| **`go.impl.cursor`**            | Generate interface stubs                           |
| **`go.install.gomodifytags`**   | Install / update gomodifytags                      |
| **`go.install.goplay`**         | Install / update goplay                            |
| **`go.install.gopls`**          | Install / update gopls                             |
| **`go.install.gotests`**        | Install / update gotests                           |
| **`go.install.impl`**           | Install / update impl                              |
| **`go.install.tools`**          | Install / update all tools                         |
| **`go.playground`**             | Run on go playground                               |
| **`go.tags.add`**               | Add tags to struct fields                          |
| **`go.tags.add.line`**          | Add tags to struct field in current line           |
| **`go.tags.add.prompt`**        | Add tags to struct fields (prompt)                 |
| **`go.tags.clear`**             | Remove all tags from struct fields                 |
| **`go.tags.clear.line`**        | Remove all tags from struct fields in current line |
| **`go.tags.remove`**            | Remove tags from struct fields                     |
| **`go.tags.remove.line`**       | Remove tags from struct field in current line      |
| **`go.tags.remove.prompt`**     | Remove tags from struct fields (prompt)            |
| **`go.test.generate.exported`** | Generate unit tests for exported functions in file |
| **`go.test.generate.file`**     | Generate unit tests for file                       |
| **`go.test.generate.function`** | Generate unit tests for current function           |
| **`go.test.toggle`**            | Toggle test file                                   |
| **`go.version`**                | Print extension version                            |

### Examples

- **Add or Remove specific tags**

  ```
  CocCommand go.tags.add yaml
  CocCommand go.tags.add yaml json xml
  CocCommand go.tags.remove xml
  ```

- **Add missing imports on save**

  ```viml
  autocmd BufWritePre *.go :silent call CocAction('runCommand', 'editor.action.organizeImport')
  ```

- **Map Keys to command**

  ```viml
  autocmd FileType go nmap gtj :CocCommand go.tags.add json<cr>
  autocmd FileType go nmap gty :CocCommand go.tags.add yaml<cr>
  autocmd FileType go nmap gtx :CocCommand go.tags.clear<cr>
  ```

## Snippets

Snippets are imported from [`golang/vscode-go`](https://github.com/microsoft/vscode-go)
and require [`coc-snippets`](https://github.com/neoclide/coc-snippets) to be
installed.

## Configuration options

| Key                                | Description                                                                                                                                                                                                                   | Default           |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| **`go.checkForUpdates`**           | Check for gopls updates on start.                                                                                                                                                                                             | install           |
| **`go.disable`**                   | Disable gopls features                                                                                                                                                                                                        | {}                |
| ‣ `completion`                     | Disable completion feature (Change requires `:CocRestart`)                                                                                                                                                                    | false             |
| ‣ `diagnostics`                    | Disable handle diagnostics (Change requires `:CocRestart`)                                                                                                                                                                    | false             |
| ‣ `features`                       | Disabled features (Change requires `:CocRestart`)                                                                                                                                                                             | []                |
| ‣ `snippetCompletion`              | Disable snippet completion (Change requires `:CocRestart`)                                                                                                                                                                    | false             |
| ‣ `workspaceFolders`               | Disable workspaceFolders feature (Change requires `:CocRestart`)                                                                                                                                                              | false             |
| **`go.enable`**                    | Enable Go extension                                                                                                                                                                                                           | true              |
| **`go.goplsArgs`**                 | Arguments passed to `gopls` (Change requires `:CocRestart`)                                                                                                                                                                   |                   |
| **`go.goplsEnv`**                  | ENV passed to `gopls` (Change requires `:CocRestart`)                                                                                                                                                                         |                   |
| **`go.goplsOptions`**              | See [`gopls` documentation](https://github.com/golang/tools/blob/master/gopls/doc/settings.md )                                                                                                                               |                   |
| ‣ `allowImplicitNetworkAccess`     | **This setting is experimental and may be deleted.**  allowImplicitNetworkAccess disables GOPROXY=off, allowing implicit module downloads rather than requiring user action.                                                  | false             |
| ‣ `analyses`                       | analyses specify analyses that the user would like to enable or disable.                                                                                                                                                      |                   |
| ‣ `analysisProgressReporting`      | analysisProgressReporting controls whether gopls sends progress notifications when construction of its index of analysis facts is taking a long time.                                                                         | true              |
| ‣ `annotations`                    | **This setting is experimental and may be deleted.**  annotations specifies the various kinds of optimization diagnostics that should be reported by the gc_details command.                                                  |                   |
| ‣ `buildFlags`                     | buildFlags is the set of flags passed on to the build system when invoked.                                                                                                                                                    |                   |
| ‣ `codelenses`                     | codelenses overrides the enabled/disabled state of each of gopls' sources of [Code Lenses](codelenses.md).                                                                                                                    |                   |
| ‣ `completeFunctionCalls`          | completeFunctionCalls enables function call completion.                                                                                                                                                                       | true              |
| ‣ `completionBudget`               | **This setting is for debugging purposes only.**  completionBudget is the soft latency goal for completion requests.                                                                                                          | 100ms             |
| ‣ `diagnosticsDelay`               | **This is an advanced setting and should not be configured by most `gopls` users.**  diagnosticsDelay controls the amount of time that gopls waits after the most recent file modification before computing deep diagnostics. | 1s                |
| ‣ `diagnosticsTrigger`             | **This setting is experimental and may be deleted.**  diagnosticsTrigger controls when to run diagnostics.                                                                                                                    | Edit              |
| ‣ `directoryFilters`               | directoryFilters can be used to exclude unwanted directories from the workspace.                                                                                                                                              |                   |
| ‣ `env`                            | env adds environment variables to external commands run by `gopls`, most notably `go list`.                                                                                                                                   |                   |
| ‣ `expandWorkspaceToModule`        | **This setting is experimental and may be deleted.**  expandWorkspaceToModule determines which packages are considered "workspace packages" when the workspace is using modules.                                              | true              |
| ‣ `experimentalPostfixCompletions` | **This setting is experimental and may be deleted.**  experimentalPostfixCompletions enables artificial method snippets such as "someSlice.sort!".                                                                            | true              |
| ‣ `gofumpt`                        | gofumpt indicates if we should run gofumpt formatting.                                                                                                                                                                        | false             |
| ‣ `hints`                          | **This setting is experimental and may be deleted.**  hints specify inlay hints that users want to see.                                                                                                                       |                   |
| ‣ `hoverKind`                      | hoverKind controls the information that appears in the hover text.                                                                                                                                                            | FullDocumentation |
| ‣ `importShortcut`                 | importShortcut specifies whether import statements should link to documentation or go to definitions.                                                                                                                         | Both              |
| ‣ `linkTarget`                     | linkTarget is the base URL for links to Go package documentation returned by LSP operations such as Hover and DocumentLinks and in the CodeDescription field of each Diagnostic.                                              | pkg.go.dev        |
| ‣ `linksInHover`                   | linksInHover controls the presence of documentation links in hover markdown.                                                                                                                                                  | true              |
| ‣ `local`                          | local is the equivalent of the `goimports -local` flag, which puts imports beginning with this string after third-party packages.                                                                                             |                   |
| ‣ `matcher`                        | **This is an advanced setting and should not be configured by most `gopls` users.**  matcher sets the algorithm that is used when calculating completion candidates.                                                          | Fuzzy             |
| ‣ `memoryMode`                     | **This setting is experimental and may be deleted.**  obsolete, no effect                                                                                                                                                     |                   |
| ‣ `noSemanticNumber`               | **This setting is experimental and may be deleted.**  noSemanticNumber  turns off the sending of the semantic token 'number'                                                                                                  | false             |
| ‣ `noSemanticString`               | **This setting is experimental and may be deleted.**  noSemanticString turns off the sending of the semantic token 'string'                                                                                                   | false             |
| ‣ `semanticTokens`                 | **This setting is experimental and may be deleted.**  semanticTokens controls whether the LSP server will send semantic tokens to the client.                                                                                 | false             |
| ‣ `standaloneTags`                 | standaloneTags specifies a set of build constraints that identify individual Go source files that make up the entire main package of an executable.                                                                           |                   |
| ‣ `staticcheck`                    | **This setting is experimental and may be deleted.**  staticcheck enables additional analyses from staticcheck.io.                                                                                                            | false             |
| ‣ `symbolMatcher`                  | **This is an advanced setting and should not be configured by most `gopls` users.**  symbolMatcher sets the algorithm that is used when finding workspace symbols.                                                            | FastFuzzy         |
| ‣ `symbolScope`                    | symbolScope controls which packages are searched for workspace/symbol requests.                                                                                                                                               | all               |
| ‣ `symbolStyle`                    | **This is an advanced setting and should not be configured by most `gopls` users.**  symbolStyle controls how symbols are qualified in symbol responses.                                                                      | Dynamic           |
| ‣ `templateExtensions`             | templateExtensions gives the extensions of file names that are treated as template files.                                                                                                                                     |                   |
| ‣ `usePlaceholders`                | placeholders enables placeholders for function parameters or struct fields in completion responses.                                                                                                                           | false             |
| ‣ `verboseOutput`                  | **This setting is for debugging purposes only.**  verboseOutput enables additional debug logging.                                                                                                                             | false             |
| ‣ `vulncheck`                      | **This setting is experimental and may be deleted.**  vulncheck enables vulnerability scanning.                                                                                                                               | Off               |
| **`go.goplsPath`**                 | Path to `gopls` bin (Change requires `:CocRestart`)                                                                                                                                                                           |                   |
| **`go.goplsUseDaemon`**            | Run gopls as daemon                                                                                                                                                                                                           | true              |
| **`go.tags`**                      |                                                                                                                                                                                                                               |                   |
| ‣ `options`                        | Comma separated tag=options pairs to be used by `go.tags.add` command                                                                                                                                                         | json=omitempty    |
| ‣ `skipUnexported`                 | If true, skip unexported fields                                                                                                                                                                                               | false             |
| ‣ `tags`                           | Comma separated tags to be used by `go.tags.add` command                                                                                                                                                                      | json              |
| ‣ `transform`                      | Transformation rule used by `go.tags.add` command to add tags                                                                                                                                                                 | snakecase         |
| **`go.tests`**                     |                                                                                                                                                                                                                               |                   |
| ‣ `generateFlags`                  | Additional command line flags to pass to `gotests` for generating tests.                                                                                                                                                      | []                |
| **`go.trace.server`**              | Trace level of gopls                                                                                                                                                                                                          | off               |

Trigger completion in `coc-settings.json` to get complete list.

### Example Configuration

```json
{
  "go.goplsOptions": {
    "completeUnimported": true
  }
}
```

## Development

1. Run `npm run build` or `npm run build:watch`
2. Link extension: `npm run link` / `npm run unlink`

## Tools

- [`gomodifytags`](http://github.com/fatih/gomodifytags) - [BSD](https://github.com/fatih/gomodifytags/blob/master/LICENSE)
- [`goplay`](http://github.com/haya14busa/goplay) - [MIT](https://github.com/haya14busa/goplay/blob/master/LICENSE)
- [`gopls`](https://golang.org/x/tools/cmd/gopls)
- [`gotests`](http://github.com/cweill/gotests) - [Apache](https://github.com/cweill/gotests/blob/develop/LICENSE)
- [`impl`](https://github.com/josharian/impl) - [MIT](https://github.com/josharian/impl/blob/master/LICENSE.txt)

## FAQ

### How does `coc-go` compare to `vim-go`?

With `coc-go` I do not aim to recreate the features of `vim-go`. For now, the
main goal is to provide a convenient way to install `gopls` and use it with
`coc.nvim`.

If you need more than the features provided by `gopls`, you are probably better
of with [`vim-go`](https://github.com/fatih/vim-go) or
[`govim`](https://github.com/govim/govim).

### How to use `coc-go` with wasm?

Add this to you (local) `coc-settings.json` (run `:CocLocalConfig`).

```json
{
  "go.goplsEnv": {
    "GOOS": "js",
    "GOARCH": "wasm",
  }
}
```

### Running `gopls` as a daemon

`coc-go` runs `gopls` as shared daemon by passing `-remote=auto` to `gopls`. To
disable this behavior set `go.goplsUseDaemon` to `false`.

See [Running gopls as a daemon](https://github.com/golang/tools/blob/master/gopls/doc/daemon.md) for more information.

## License

[MIT © Josa Gesell](LICENSE).

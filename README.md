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
  autocmd BufWritePre *.go :call CocAction('organizeImport')
  ```

- **Map Keys to command**

  ```viml
  autocmd FileType go nmap gtj :CocCommand go.tags.add json<cr>
  autocmd FileType go nmap gty :CocCommand go.tags.add yaml<cr>
  autocmd FileType go nmap gtx :CocCommand go.tags.clear<cr>
  ```

## Snippets

Snippets are imported from [`microsoft/vscode-go`](https://github.com/microsoft/vscode-go)
and require [`coc-snippets`](https://github.com/neoclide/coc-snippets) to be
installed.

## Configuration options

| Key                             | Description                                                                                                                                                 | Default           |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| **`go.checkForUpdates`**        | **EXPERIMENTAL** Check for gopls updates on start.                                                                                                          | disabled          |
| **`go.disable`**                | Disable gopls features                                                                                                                                      | {}                |
| ‣ `completion`                  | Disable completion feature (Change requires `:CocRestart`)                                                                                                  | false             |
| ‣ `diagnostics`                 | Disable handle diagnostics (Change requires `:CocRestart`)                                                                                                  | false             |
| ‣ `workspaceFolders`            | Disable workspaceFolders feature (Change requires `:CocRestart`)                                                                                            | false             |
| **`go.enable`**                 | Enable Go extension                                                                                                                                         | true              |
| **`go.goplsArgs`**              | Arguments passed to `gopls` (Change requires `:CocRestart`)                                                                                                 |                   |
| **`go.goplsEnv`**               | ENV passed to `gopls` (Change requires `:CocRestart`)                                                                                                       |                   |
| **`go.goplsOptions`**           | See [`gopls` documentation](https://github.com/golang/tools/blob/master/gopls/doc/settings.md )                                                             |                   |
| ‣ `analyses`                    | **EXPERIMENTAL** analyses specify analyses that the user would like to enable or disable.                                                                   |                   |
| ‣ `annotations`                 | **EXPERIMENTAL** annotations suppress various kinds of optimization diagnostics that would be reported by the gc_details command.                           |                   |
| ‣ `buildFlags`                  | buildFlags is the set of flags passed on to the build system when invoked.                                                                                  |                   |
| ‣ `codelens`                    | **EXPERIMENTAL** codelens overrides the enabled/disabled state of code lenses.                                                                              |                   |
| ‣ `completeUnimported`          | **EXPERIMENTAL** completeUnimported enables completion for packages that you do not currently import.                                                       | true              |
| ‣ `completionDocumentation`     | **EXPERIMENTAL** completionDocumentation enables documentation with completion results.                                                                     | true              |
| ‣ `deepCompletion`              | **EXPERIMENTAL** deepCompletion enables the ability to return completions from deep inside relevant entities, rather than just the locally accessible ones. | true              |
| ‣ `env`                         | env adds environment variables to external commands run by `gopls`, most notably `go list`.                                                                 |                   |
| ‣ `expandWorkspaceToModule`     | **EXPERIMENTAL** expandWorkspaceToModule instructs `gopls` to expand the scope of the workspace to include the modules containing the workspace folders.    | true              |
| ‣ `experimentalWorkspaceModule` | **EXPERIMENTAL** experimentalWorkspaceModule opts a user into the experimental support for multi-module workspaces.                                         | false             |
| ‣ `gofumpt`                     | gofumpt indicates if we should run gofumpt formatting.                                                                                                      | false             |
| ‣ `hoverKind`                   | hoverKind controls the information that appears in the hover text.                                                                                          | FullDocumentation |
| ‣ `importShortcut`              | **EXPERIMENTAL** importShortcut specifies whether import statements should link to documentation or go to definitions.                                      | Both              |
| ‣ `linkTarget`                  | linkTarget controls where documentation links go.                                                                                                           | pkg.go.dev        |
| ‣ `linksInHover`                | **EXPERIMENTAL** linksInHover toggles the presence of links to documentation in hover.                                                                      | true              |
| ‣ `literalCompletions`          | **EXPERIMENTAL** literalCompletions controls whether literal candidates such as "&someStruct{}" are offered.                                                | true              |
| ‣ `local`                       | local is the equivalent of the `goimports -local` flag, which puts imports beginning with this string after 3rd-party packages.                             |                   |
| ‣ `matcher`                     | **EXPERIMENTAL** matcher sets the algorithm that is used when calculating completion candidates.                                                            | Fuzzy             |
| ‣ `staticcheck`                 | **EXPERIMENTAL** staticcheck enables additional analyses from staticcheck.io.                                                                               | false             |
| ‣ `symbolMatcher`               | **EXPERIMENTAL** symbolMatcher sets the algorithm that is used when finding workspace symbols.                                                              | Fuzzy             |
| ‣ `symbolStyle`                 | **EXPERIMENTAL** symbolStyle specifies what style of symbols to return in symbol requests.                                                                  | Package           |
| ‣ `tempModfile`                 | **EXPERIMENTAL** tempModfile controls the use of the -modfile flag in Go 1.14.                                                                              | true              |
| ‣ `usePlaceholders`             | placeholders enables placeholders for function parameters or struct fields in completion responses.                                                         | false             |
| ‣ `verboseWorkDoneProgress`     | **EXPERIMENTAL** verboseWorkDoneProgress controls whether the LSP server should send progress reports for all work done outside the scope of an RPC.        | false             |
| **`go.goplsPath`**              | Path to `gopls` bin (Change requires `:CocRestart`)                                                                                                         |                   |
| **`go.goplsUseDaemon`**         | Run gopls as daemon                                                                                                                                         | true              |
| **`go.tags`**                   |                                                                                                                                                             |                   |
| ‣ `options`                     | Comma separated tag=options pairs to be used by `go.tags.add` command                                                                                       | json=omitempty    |
| ‣ `skipUnexported`              | If true, skip unexported fields                                                                                                                             | false             |
| ‣ `tags`                        | Comma separated tags to be used by `go.tags.add` command                                                                                                    | json              |
| ‣ `transform`                   | Transformation rule used by `go.tags.add` command to add tags                                                                                               | snakecase         |
| **`go.tests`**                  |                                                                                                                                                             |                   |
| ‣ `generateFlags`               | Additional command line flags to pass to `gotests` for generating tests.                                                                                    | []                |
| **`go.trace.server`**           | Trace level of gopls                                                                                                                                        | off               |

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

1. Run `yarn build` or `yarn build:watch`
2. Link extension: `yarn run link` / `yarn run unlink`

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
